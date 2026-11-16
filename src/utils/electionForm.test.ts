import { describe, expect, it } from "vitest";
import {
  ELECTION_DESCRIPTION_MAX_LENGTH,
  ELECTION_NAME_MAX_LENGTH,
  electionToFormValues,
  hasFormErrors,
  isSameElectionForm,
  toDateTimeLocal,
  toElectionRequest,
  validateElectionForm,
  type ElectionFormValues,
} from "./electionForm";

const now = new Date("2026-11-01T12:00:00");
const valid: ElectionFormValues = {
  name: "Elección",
  description: "Descripción",
  startDate: "2026-11-02T10:00",
  endDate: "2026-11-02T12:00",
};

describe("validateElectionForm", () => {
  it("acepta un formulario válido", () => {
    expect(hasFormErrors(validateElectionForm(valid, now))).toBe(false);
  });

  it("exige nombre, descripción y fechas", () => {
    const errors = validateElectionForm({ name: " ", description: "", startDate: "", endDate: "" }, now);
    expect(Object.keys(errors).sort()).toEqual(["description", "endDate", "name", "startDate"]);
  });

  it("limita la longitud del nombre y la descripción", () => {
    const errors = validateElectionForm(
      { ...valid, name: "a".repeat(ELECTION_NAME_MAX_LENGTH + 1), description: "a".repeat(ELECTION_DESCRIPTION_MAX_LENGTH + 1) },
      now,
    );
    expect(errors.name).toMatch(/máximo/);
    expect(errors.description).toMatch(/máximo/);
    expect(hasFormErrors(validateElectionForm(
      { ...valid, name: "a".repeat(ELECTION_NAME_MAX_LENGTH), description: "a".repeat(ELECTION_DESCRIPTION_MAX_LENGTH) },
      now,
    ))).toBe(false);
  });

  it("rechaza fechas pasadas", () => {
    const errors = validateElectionForm({ ...valid, startDate: "2026-10-30T10:00", endDate: "2026-10-31T10:00" }, now);
    expect(errors.startDate).toMatch(/futura/);
    expect(errors.endDate).toMatch(/futura/);
  });

  it("exige que el inicio sea anterior a la finalización", () => {
    const errors = validateElectionForm({ ...valid, startDate: "2026-11-02T12:00", endDate: "2026-11-02T10:00" }, now);
    expect(errors.endDate).toMatch(/posterior/);
    expect(validateElectionForm({ ...valid, endDate: valid.startDate }, now).endDate).toBeDefined();
  });
});

describe("conversiones", () => {
  it("convierte ISO a datetime-local y de vuelta a ISO", () => {
    const iso = "2026-11-21T12:00:00.000Z";
    const local = toDateTimeLocal(iso);
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(new Date(local).toISOString()).toBe(iso);
  });

  it("devuelve cadena vacía ante fechas inválidas", () => {
    expect(toDateTimeLocal("no-es-fecha")).toBe("");
  });

  it("construye la solicitud con textos recortados y fechas ISO", () => {
    const request = toElectionRequest({ ...valid, name: "  Elección  " });
    expect(request.name).toBe("Elección");
    expect(request.startDate).toBe(new Date(valid.startDate).toISOString());
  });

  it("detecta si el formulario no cambió", () => {
    const election = { name: "A", description: "B", startDate: "2026-11-21T12:00:00Z", endDate: "2026-11-21T13:00:00Z" };
    const values = electionToFormValues(election);
    expect(isSameElectionForm(values, electionToFormValues(election))).toBe(true);
    expect(isSameElectionForm({ ...values, name: "C" }, values)).toBe(false);
  });
});
