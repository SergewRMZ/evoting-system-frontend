import { beforeEach, describe, expect, it, vi } from "vitest";
import electionServiceApi from "./election.api";
import authorizationServiceApi from "../authorization-service/authorization.api";
import tallyServiceApi from "../tally-service/tally-service.api";
import {
  buildActivationSteps,
  buildTallySteps,
  buildValidationSteps,
  executeSteps,
  toInitialSteps,
  type OperationStep,
} from "./election-lifecycle";

vi.mock("./election.api", () => ({
  default: { validateElection: vi.fn(), activateElection: vi.fn(), finishElection: vi.fn() },
}));
vi.mock("../authorization-service/authorization.api", () => ({
  default: { createKeys: vi.fn(), activateKeys: vi.fn(), getPublicKey: vi.fn() },
}));
vi.mock("../tally-service/tally-service.api", () => ({
  default: { createKeys: vi.fn(), activateKeys: vi.fn(), getPublicKey: vi.fn(), tallyElection: vi.fn() },
}));

const httpError = (status: number, title?: string) => ({
  isAxiosError: true,
  response: { status, data: title ? { title } : {} },
});

const mocked = {
  validate: vi.mocked(electionServiceApi.validateElection),
  activate: vi.mocked(electionServiceApi.activateElection),
  finish: vi.mocked(electionServiceApi.finishElection),
  authCreate: vi.mocked(authorizationServiceApi.createKeys),
  authActivate: vi.mocked(authorizationServiceApi.activateKeys),
  authPublic: vi.mocked(authorizationServiceApi.getPublicKey),
  tallyCreate: vi.mocked(tallyServiceApi.createKeys),
  tallyActivate: vi.mocked(tallyServiceApi.activateKeys),
  tallyPublic: vi.mocked(tallyServiceApi.getPublicKey),
  tally: vi.mocked(tallyServiceApi.tallyElection),
};

const run = async (definitions: ReturnType<typeof buildValidationSteps>, initial?: OperationStep[]) => {
  let last = initial ?? toInitialSteps(definitions);
  const completed = await executeSteps(definitions, last, (steps) => {
    last = steps;
  });
  return { completed, steps: last };
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("validación", () => {
  it("valida la elección y genera ambos pares de claves en orden", async () => {
    const order: string[] = [];
    mocked.validate.mockImplementation(async () => { order.push("state"); return {} as never; });
    mocked.authCreate.mockImplementation(async () => { order.push("auth"); return {} as never; });
    mocked.tallyCreate.mockImplementation(async () => { order.push("tally"); return {} as never; });

    const { completed, steps } = await run(buildValidationSteps("e1", "PUBLISHED"));

    expect(completed).toBe(true);
    expect(order).toEqual(["state", "auth", "tally"]);
    expect(steps.every((step) => step.status === "done")).toBe(true);
    expect(mocked.validate).toHaveBeenCalledWith("e1");
  });

  it("no genera claves si falla el cambio de estado", async () => {
    mocked.validate.mockRejectedValue(httpError(409));

    const { completed, steps } = await run(buildValidationSteps("e1", "PUBLISHED"));

    expect(completed).toBe(false);
    expect(steps[0].status).toBe("error");
    expect(steps[0].error).toBeTruthy();
    expect(steps[1].status).toBe("pending");
    expect(mocked.authCreate).not.toHaveBeenCalled();
    expect(mocked.tallyCreate).not.toHaveBeenCalled();
  });

  it("tras un fallo parcial solo reintenta los pasos pendientes, sin repetir el cambio de estado", async () => {
    mocked.validate.mockResolvedValue({} as never);
    mocked.authCreate.mockResolvedValue({} as never);
    mocked.tallyCreate.mockRejectedValueOnce(httpError(500));

    const definitions = buildValidationSteps("e1", "PUBLISHED");
    const first = await run(definitions);
    expect(first.completed).toBe(false);
    expect(first.steps.map((s) => s.status)).toEqual(["done", "done", "error"]);

    mocked.tallyCreate.mockResolvedValueOnce({} as never);
    const retry = await run(definitions, first.steps);

    expect(retry.completed).toBe(true);
    expect(mocked.validate).toHaveBeenCalledTimes(1);
    expect(mocked.authCreate).toHaveBeenCalledTimes(1);
    expect(mocked.tallyCreate).toHaveBeenCalledTimes(2);
  });

  it("omite el cambio de estado si la elección ya estaba validada", async () => {
    mocked.authCreate.mockResolvedValue({} as never);
    mocked.tallyCreate.mockResolvedValue({} as never);

    const { completed, steps } = await run(buildValidationSteps("e1", "VERIFIED"));

    expect(completed).toBe(true);
    expect(steps[0].status).toBe("skipped");
    expect(mocked.validate).not.toHaveBeenCalled();
  });

  it("trata las claves ya existentes como resueltas sin regenerarlas", async () => {
    mocked.authCreate.mockRejectedValue(httpError(503, "Created Key Conflict"));
    mocked.tallyCreate.mockRejectedValue(httpError(409));

    const { completed, steps } = await run(buildValidationSteps("e1", "VERIFIED"));

    expect(completed).toBe(true);
    expect(steps.map((s) => s.status)).toEqual(["skipped", "skipped", "skipped"]);
  });

  it("un 503 sin el título de conflicto es una caída del servicio, no una clave existente", async () => {
    mocked.validate.mockResolvedValue({} as never);
    mocked.authCreate.mockRejectedValue(httpError(503));

    const { completed, steps } = await run(buildValidationSteps("e1", "PUBLISHED"));

    expect(completed).toBe(false);
    expect(steps[1].status).toBe("error");
    expect(mocked.tallyCreate).not.toHaveBeenCalled();
  });
});

describe("activación", () => {
  it("activa la elección y habilita las claves existentes sin crear nuevas", async () => {
    mocked.activate.mockResolvedValue({} as never);
    mocked.authPublic.mockRejectedValue(httpError(404));
    mocked.authActivate.mockResolvedValue({} as never);
    mocked.tallyPublic.mockResolvedValue({ status: "CREATED" } as never);
    mocked.tallyActivate.mockResolvedValue({} as never);

    const { completed } = await run(buildActivationSteps("e1", "VERIFIED"));

    expect(completed).toBe(true);
    expect(mocked.activate).toHaveBeenCalledWith("e1");
    expect(mocked.authActivate).toHaveBeenCalledWith("e1");
    expect(mocked.tallyActivate).toHaveBeenCalledWith("e1");
    expect(mocked.authCreate).not.toHaveBeenCalled();
    expect(mocked.tallyCreate).not.toHaveBeenCalled();
  });

  it("no vuelve a habilitar claves que ya están activas", async () => {
    mocked.authPublic.mockResolvedValue({} as never);
    mocked.tallyPublic.mockResolvedValue({ status: "ACTIVE" } as never);

    const { completed, steps } = await run(buildActivationSteps("e1", "ACTIVE"));

    expect(completed).toBe(true);
    expect(steps.map((s) => s.status)).toEqual(["skipped", "skipped", "skipped"]);
    expect(mocked.activate).not.toHaveBeenCalled();
    expect(mocked.authActivate).not.toHaveBeenCalled();
    expect(mocked.tallyActivate).not.toHaveBeenCalled();
  });

  it("detiene el proceso si el cambio de estado es rechazado (p. ej. fuera de horario)", async () => {
    mocked.activate.mockRejectedValue(httpError(409));

    const { completed, steps } = await run(buildActivationSteps("e1", "VERIFIED"));

    expect(completed).toBe(false);
    expect(steps[0].status).toBe("error");
    expect(mocked.authActivate).not.toHaveBeenCalled();
  });

  it("un error distinto de 404 al consultar la llave no se interpreta como llave inactiva", async () => {
    mocked.activate.mockResolvedValue({} as never);
    mocked.authPublic.mockRejectedValue(httpError(500));

    const { completed, steps } = await run(buildActivationSteps("e1", "VERIFIED"));

    expect(completed).toBe(false);
    expect(steps[1].status).toBe("error");
    expect(mocked.authActivate).not.toHaveBeenCalled();
  });
});

describe("escrutinio", () => {
  it("contabiliza los votos y después finaliza la elección", async () => {
    const order: string[] = [];
    mocked.tally.mockImplementation(async () => { order.push("tally"); return []; });
    mocked.finish.mockImplementation(async () => { order.push("finish"); return {} as never; });

    const { completed, steps } = await run(buildTallySteps("e1", "CLOSED"));

    expect(completed).toBe(true);
    expect(order).toEqual(["tally", "finish"]);
    expect(mocked.finish).toHaveBeenCalledWith("e1");
    expect(steps.map((step) => step.status)).toEqual(["done", "done"]);
  });

  it("no finaliza la elección si el conteo falla", async () => {
    mocked.tally.mockRejectedValue(httpError(500));

    const { completed, steps } = await run(buildTallySteps("e1", "CLOSED"));

    expect(completed).toBe(false);
    expect(mocked.finish).not.toHaveBeenCalled();
    expect(steps[1].status).toBe("pending");
  });

  it("al reintentar tras fallar la finalización no vuelve a contar", async () => {
    mocked.tally.mockResolvedValue([]);
    mocked.finish.mockRejectedValueOnce(httpError(500));
    const definitions = buildTallySteps("e1", "CLOSED");
    const first = await run(definitions);
    expect(first.completed).toBe(false);

    mocked.finish.mockResolvedValueOnce({} as never);
    const retry = await run(definitions, first.steps);

    expect(retry.completed).toBe(true);
    expect(mocked.tally).toHaveBeenCalledTimes(1);
    expect(mocked.finish).toHaveBeenCalledTimes(2);
  });

  it("omite la finalización si la elección ya estaba finalizada", async () => {
    mocked.tally.mockResolvedValue([]);

    const { completed, steps } = await run(buildTallySteps("e1", "FINISHED"));

    expect(completed).toBe(true);
    expect(mocked.finish).not.toHaveBeenCalled();
    expect(steps[1].status).toBe("skipped");
  });

  it("omite el paso si otro intento ya terminó el conteo", async () => {
    mocked.finish.mockResolvedValue({} as never);
    mocked.tally.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { code: "ELECTION_ALREADY_TALLIED" } },
    });

    const { completed, steps } = await run(buildTallySteps("e1", "CLOSED"));

    expect(completed).toBe(true);
    expect(steps[0].status).toBe("skipped");
  });

  it("no confunde otros conflictos con un conteo ya terminado", async () => {
    mocked.tally.mockRejectedValue(httpError(409));

    const { completed, steps } = await run(buildTallySteps("e1", "CLOSED"));

    expect(completed).toBe(false);
    expect(steps[0].status).toBe("error");
  });

  it("reporta el error si el conteo falla", async () => {
    mocked.tally.mockRejectedValue(httpError(500));

    const { completed, steps } = await run(buildTallySteps("e1", "CLOSED"));

    expect(completed).toBe(false);
    expect(steps[0].status).toBe("error");
  });
});
