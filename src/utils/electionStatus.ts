import type { ElectionDetails, ElectionStatus } from "../services/election-service/election.types";

export type StatusColor = "default" | "info" | "warning" | "success" | "secondary" | "error";

type StatusMeta = {
  label: string;
  color: StatusColor;
  /** Qué significa este estado para quien administra la elección. */
  description: string;
};

export const ELECTION_STATUS_META: Record<ElectionStatus, StatusMeta> = {
  DRAFT: {
    label: "Borrador",
    color: "default",
    description: "La elección se está configurando. Puede editarse mientras permanezca en este estado.",
  },
  CREATED: {
    label: "Creada",
    color: "default",
    description: "La elección fue registrada y espera su configuración.",
  },
  PUBLISHED: {
    label: "Publicada",
    color: "info",
    description: "La configuración quedó cerrada. Una autoridad electoral debe validarla.",
  },
  VERIFIED: {
    label: "Validada",
    color: "warning",
    description: "La elección fue validada y sus claves criptográficas existen. Falta activarla cuando llegue su horario.",
  },
  ACTIVE: {
    label: "Activa",
    color: "success",
    description: "La elección está recibiendo votos.",
  },
  CLOSED: {
    label: "Cerrada",
    color: "secondary",
    description: "El periodo de votación terminó. Una autoridad debe contabilizar los votos.",
  },
  FINISHED: {
    label: "Finalizada",
    color: "secondary",
    description: "El conteo se realizó y los resultados están disponibles.",
  },
};

/** Etapas del ciclo de vida, en orden. `CREATED` no forma parte del flujo vigente del backend. */
export const LIFECYCLE_STAGES: ElectionStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "VERIFIED",
  "ACTIVE",
  "CLOSED",
  "FINISHED",
];

export const getStatusLabel = (status: ElectionStatus) => ELECTION_STATUS_META[status].label;

/** Índice de la etapa actual dentro de `LIFECYCLE_STAGES` (CREATED se trata como borrador). */
export const getStageIndex = (status: ElectionStatus) =>
  Math.max(0, LIFECYCLE_STAGES.indexOf(status === "CREATED" ? "DRAFT" : status));

/** Solo una elección en borrador puede modificarse (regla del backend). */
export const isElectionEditable = (status: ElectionStatus) => status === "DRAFT";

export const isElectionReadyToPublish = (election: Pick<ElectionDetails, "positions">) =>
  election.positions.length > 0 &&
  election.positions.every((position) => position.candidacies.length > 0);

export type ElectionRoles = {
  isAdmin: boolean;
  isAuthority: boolean;
};

export type ElectionActionId =
  | "configure"
  | "validate"
  | "complete-validation"
  | "activate"
  | "complete-activation"
  | "tally";

export type ElectionActionGroup = "configuration" | "validation" | "activation" | "tally";

export type ElectionAction = {
  id: ElectionActionId;
  group: ElectionActionGroup;
  label: string;
  enabled: boolean;
  /** Por qué no está disponible. */
  reason?: string;
  /** Acción principal sugerida para el estado actual. */
  primary?: boolean;
};

/**
 * Acciones de gestión visibles para los roles dados según el estado de la elección.
 * Las acciones de un rol que no tiene el usuario se omiten; las que el rol tiene pero
 * no corresponden al estado actual se devuelven deshabilitadas con su motivo.
 */
export function getElectionActions(status: ElectionStatus, roles: ElectionRoles): ElectionAction[] {
  const actions: ElectionAction[] = [];

  if (roles.isAdmin) {
    const editable = isElectionEditable(status);
    actions.push({
      id: "configure",
      group: "configuration",
      label: "Editar y configurar",
      enabled: editable,
      primary: editable,
      reason: editable ? undefined : "La configuración se cerró cuando la elección salió del estado Borrador.",
    });
  }

  if (roles.isAuthority) {
    actions.push({
      id: "validate",
      group: "validation",
      label: "Validar elección",
      enabled: status === "PUBLISHED",
      primary: status === "PUBLISHED",
      reason: reasonForValidate(status),
    });
    if (status === "VERIFIED") {
      actions.push({
        id: "complete-validation",
        group: "validation",
        label: "Completar claves pendientes",
        enabled: true,
      });
    }

    actions.push({
      id: "activate",
      group: "activation",
      label: "Activar elección",
      enabled: status === "VERIFIED",
      primary: status === "VERIFIED",
      reason: reasonForActivate(status),
    });
    if (status === "ACTIVE") {
      actions.push({
        id: "complete-activation",
        group: "activation",
        label: "Completar activación de claves",
        enabled: true,
      });
    }

    if (status === "CLOSED") {
      actions.push({
        id: "tally",
        group: "tally",
        label: "Contabilizar votos",
        enabled: true,
        primary: true,
      });
    }
  }

  return actions;
}

function reasonForValidate(status: ElectionStatus): string | undefined {
  if (status === "PUBLISHED") return undefined;
  if (status === "DRAFT" || status === "CREATED") return "La elección debe ser publicada por un administrador antes de validarse.";
  return "La elección ya fue validada.";
}

function reasonForActivate(status: ElectionStatus): string | undefined {
  if (status === "VERIFIED") return undefined;
  if (status === "ACTIVE" || status === "CLOSED" || status === "FINISHED") return "La elección ya fue activada.";
  return "La elección debe estar validada antes de activarse.";
}

/** Texto de "qué sigue" según el estado y los roles de gestión. */
export function getNextStepHint(status: ElectionStatus, roles: ElectionRoles): string {
  switch (status) {
    case "DRAFT":
    case "CREATED":
      return roles.isAdmin
        ? "Configura los cargos y candidaturas y publica la elección para que una autoridad pueda validarla."
        : "Un administrador debe terminar la configuración y publicar la elección.";
    case "PUBLISHED":
      return roles.isAuthority
        ? "Revisa la elección y valídala. Se generarán sus claves criptográficas."
        : "Una autoridad electoral debe validar la elección.";
    case "VERIFIED":
      return roles.isAuthority
        ? "Activa la elección cuando llegue su horario de inicio para habilitar la votación."
        : "Una autoridad electoral activará la elección en su horario de inicio.";
    case "ACTIVE":
      return "Los votantes pueden emitir su voto hasta la fecha de finalización; la elección se cerrará automáticamente.";
    case "CLOSED":
      return roles.isAuthority
        ? "Contabiliza los votos para publicar los resultados."
        : "Una autoridad electoral contabilizará los votos.";
    case "FINISHED":
      return "El proceso terminó. Consulta los resultados finales.";
  }
}

/** Instante actual en ms; aislado para usarlo desde manejadores de eventos y poder simularlo en pruebas. */
export const currentTimeMs = () => Date.now();
