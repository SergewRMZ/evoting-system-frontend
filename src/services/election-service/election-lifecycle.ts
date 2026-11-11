import authorizationServiceApi from "../authorization-service/authorization.api";
import tallyServiceApi from "../tally-service/tally-service.api";
import electionServiceApi from "./election.api";
import type { ElectionStatus } from "./election.types";
import { getApiErrorMessage, getHttpStatus, getProblemCode, getProblemTitle, type ApiErrorContext } from "../../errors/apiErrorMap";

/**
 * Orquestación de las operaciones de validación, activación y escrutinio de una elección.
 *
 * El backend de `election-service` solo cambia el estado de la elección; las claves
 * criptográficas viven en `authorization-service` (firma ciega) y `tally-service`
 * (cifrado). Cada operación se ejecuta como una secuencia de pasos que:
 *  - omite los pasos ya resueltos (para poder reanudar tras un fallo parcial);
 *  - se detiene en el primer error;
 *  - nunca regenera claves: si ya existen, los servicios rechazan la creación y el
 *    paso se marca como omitido.
 */

export type StepStatus = "pending" | "running" | "done" | "skipped" | "error";

export type OperationStep = {
  id: string;
  label: string;
  status: StepStatus;
  /** Aclaración mostrada junto al paso (p. ej. por qué se omitió). */
  note?: string;
  error?: string;
};

/** Resultado de un paso: `skipped` indica que no hizo falta ejecutarlo. */
export type StepOutcome = { skipped: string } | void;

export type StepDefinition = {
  id: string;
  label: string;
  errorContext: ApiErrorContext;
  run: () => Promise<StepOutcome>;
};

export const toInitialSteps = (definitions: StepDefinition[]): OperationStep[] =>
  definitions.map(({ id, label }) => ({ id, label, status: "pending" }));

const AUTH_KEY_EXISTS_TITLE = "Created Key Conflict";

/** authorization-service responde 503 + "Created Key Conflict" cuando la llave ya existe. */
export const isAuthorizationKeyAlreadyCreated = (error: unknown) =>
  getHttpStatus(error) === 503 && getProblemTitle(error) === AUTH_KEY_EXISTS_TITLE;

/** tally-service responde 409 cuando las llaves de cifrado ya existen. */
export const isEncryptionKeyAlreadyCreated = (error: unknown) => getHttpStatus(error) === 409;

/** tally-service lo indica cuando otro intento ya terminó el conteo de la elección. */
export const isElectionAlreadyTallied = (error: unknown) => getProblemCode(error) === "ELECTION_ALREADY_TALLIED";

export function buildValidationSteps(electionId: string, status: ElectionStatus): StepDefinition[] {
  return [
    {
      id: "state",
      label: "Cambiar el estado de la elección a Validada",
      errorContext: "election",
      run: async () => {
        if (status === "VERIFIED") return { skipped: "La elección ya estaba validada." };
        await electionServiceApi.validateElection(electionId);
      },
    },
    {
      id: "authorization-keys",
      label: "Generar las claves de autorización (firma ciega)",
      errorContext: "authorization",
      run: async () => {
        try {
          await authorizationServiceApi.createKeys(electionId);
        } catch (error) {
          if (isAuthorizationKeyAlreadyCreated(error)) return { skipped: "Las claves ya existían; no se regeneraron." };
          throw error;
        }
      },
    },
    {
      id: "encryption-keys",
      label: "Generar las claves de cifrado",
      errorContext: "tally",
      run: async () => {
        try {
          await tallyServiceApi.createKeys(electionId);
        } catch (error) {
          if (isEncryptionKeyAlreadyCreated(error)) return { skipped: "Las claves ya existían; no se regeneraron." };
          throw error;
        }
      },
    },
  ];
}

export function buildActivationSteps(electionId: string, status: ElectionStatus): StepDefinition[] {
  return [
    {
      id: "state",
      label: "Cambiar el estado de la elección a Activa",
      errorContext: "election",
      run: async () => {
        if (status === "ACTIVE") return { skipped: "La elección ya estaba activa." };
        await electionServiceApi.activateElection(electionId);
      },
    },
    {
      id: "authorization-keys",
      label: "Habilitar las claves de autorización existentes",
      errorContext: "authorization",
      run: async () => {
        // La llave pública solo se publica cuando está ACTIVE: si responde, ya está habilitada.
        try {
          await authorizationServiceApi.getPublicKey(electionId);
          return { skipped: "Las claves ya estaban habilitadas." };
        } catch (error) {
          if (getHttpStatus(error) !== 404) throw error;
        }
        await authorizationServiceApi.activateKeys(electionId);
      },
    },
    {
      id: "encryption-keys",
      label: "Habilitar las claves de cifrado existentes",
      errorContext: "tally",
      run: async () => {
        const key = await tallyServiceApi.getPublicKey(electionId);
        if (key.status === "ACTIVE") return { skipped: "Las claves ya estaban habilitadas." };
        await tallyServiceApi.activateKeys(electionId);
      },
    },
  ];
}

export function buildTallySteps(electionId: string): StepDefinition[] {
  return [
    {
      id: "tally",
      label: "Descifrar y contabilizar los votos",
      errorContext: "tally",
      run: async () => {
        // tally-service guarda los resultados y cambia la elección a FINISHED en la misma solicitud.
        // Si un intento anterior solo guardó los resultados, los reutiliza y termina de finalizarla.
        try {
          await tallyServiceApi.tallyElection(electionId);
        } catch (error) {
          if (isElectionAlreadyTallied(error)) return { skipped: "La elección ya estaba contabilizada." };
          throw error;
        }
      },
    },
  ];
}

const patchStep = (steps: OperationStep[], index: number, patch: Partial<OperationStep>): OperationStep[] =>
  steps.map((step, i) => (i === index ? { ...step, ...patch } : step));

/**
 * Ejecuta en orden los pasos que aún no están resueltos (`done`/`skipped`).
 * @returns `true` si todos los pasos terminaron; `false` si alguno falló.
 */
export async function executeSteps(
  definitions: StepDefinition[],
  initialSteps: OperationStep[],
  onChange: (steps: OperationStep[]) => void,
): Promise<boolean> {
  let steps = initialSteps;
  const publish = (next: OperationStep[]) => {
    steps = next;
    onChange(steps);
  };

  for (let index = 0; index < definitions.length; index++) {
    const current = steps[index];
    if (current.status === "done" || current.status === "skipped") continue;

    publish(patchStep(steps, index, { status: "running", error: undefined }));
    try {
      const outcome = await definitions[index].run();
      publish(
        patchStep(steps, index, outcome ? { status: "skipped", note: outcome.skipped } : { status: "done" }),
      );
    } catch (error) {
      publish(
        patchStep(steps, index, {
          status: "error",
          error: getApiErrorMessage(error, definitions[index].errorContext),
        }),
      );
      return false;
    }
  }
  return true;
}
