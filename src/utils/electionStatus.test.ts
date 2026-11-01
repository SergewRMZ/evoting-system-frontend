import { describe, expect, it } from "vitest";
import {
  getElectionActions,
  getNextStepHint,
  getStageIndex,
  isElectionEditable,
  isElectionReadyToPublish,
} from "./electionStatus";

const authority = { isAdmin: false, isAuthority: true };
const admin = { isAdmin: true, isAuthority: false };
const voter = { isAdmin: false, isAuthority: false };

const find = (status: Parameters<typeof getElectionActions>[0], roles: typeof admin, id: string) =>
  getElectionActions(status, roles).find((action) => action.id === id);

describe("isElectionEditable", () => {
  it("solo permite editar elecciones en borrador", () => {
    expect(isElectionEditable("DRAFT")).toBe(true);
    for (const status of ["PUBLISHED", "VERIFIED", "ACTIVE", "CLOSED", "FINISHED"] as const) {
      expect(isElectionEditable(status)).toBe(false);
    }
  });
});

describe("getElectionActions", () => {
  it("el administrador puede configurar únicamente en borrador", () => {
    expect(find("DRAFT", admin, "configure")).toMatchObject({ enabled: true, primary: true });
    const closed = find("PUBLISHED", admin, "configure");
    expect(closed?.enabled).toBe(false);
    expect(closed?.reason).toBeTruthy();
  });

  it("la autoridad solo puede validar una elección publicada", () => {
    expect(find("PUBLISHED", authority, "validate")?.enabled).toBe(true);
    for (const status of ["DRAFT", "VERIFIED", "ACTIVE", "CLOSED", "FINISHED"] as const) {
      expect(find(status, authority, "validate")?.enabled).toBe(false);
    }
  });

  it("la autoridad solo puede activar una elección validada", () => {
    expect(find("VERIFIED", authority, "activate")?.enabled).toBe(true);
    for (const status of ["DRAFT", "PUBLISHED", "ACTIVE", "CLOSED", "FINISHED"] as const) {
      expect(find(status, authority, "activate")?.enabled).toBe(false);
    }
  });

  it("ofrece completar claves solo cuando corresponde", () => {
    expect(find("VERIFIED", authority, "complete-validation")).toBeDefined();
    expect(find("PUBLISHED", authority, "complete-validation")).toBeUndefined();
    expect(find("ACTIVE", authority, "complete-activation")).toBeDefined();
    expect(find("VERIFIED", authority, "complete-activation")).toBeUndefined();
  });

  it("el escrutinio solo está disponible con la elección cerrada", () => {
    expect(find("CLOSED", authority, "tally")?.enabled).toBe(true);
    expect(find("ACTIVE", authority, "tally")).toBeUndefined();
  });

  it("no ofrece acciones de gestión a un votante ni mezcla roles", () => {
    expect(getElectionActions("PUBLISHED", voter)).toEqual([]);
    expect(find("PUBLISHED", admin, "validate")).toBeUndefined();
    expect(find("DRAFT", authority, "configure")).toBeUndefined();
  });
});

describe("estado y ciclo de vida", () => {
  it("ubica cada estado en su etapa", () => {
    expect(getStageIndex("DRAFT")).toBe(0);
    expect(getStageIndex("CREATED")).toBe(0);
    expect(getStageIndex("VERIFIED")).toBe(2);
    expect(getStageIndex("FINISHED")).toBe(5);
  });

  it("describe el siguiente paso según el rol", () => {
    expect(getNextStepHint("PUBLISHED", authority)).toMatch(/valídala/i);
    expect(getNextStepHint("PUBLISHED", admin)).toMatch(/autoridad/i);
  });

  it("una elección está lista para publicar si todos sus cargos tienen candidaturas", () => {
    const candidacy = { candidacyId: "c", candidate: { id: "1", name: "A", lastName: "B", description: "", isActive: true } };
    const position = (candidacies: unknown[]) =>
      ({ electionPositionId: "e", positionId: "p", positionName: "P", candidacies }) as never;
    expect(isElectionReadyToPublish({ positions: [] })).toBe(false);
    expect(isElectionReadyToPublish({ positions: [position([])] })).toBe(false);
    expect(isElectionReadyToPublish({ positions: [position([candidacy])] })).toBe(true);
  });
});
