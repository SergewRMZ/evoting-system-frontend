import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VoterReviewDialog from "./VoterReviewDialog";
import votersApi, { getApprovalErrorMessage } from "../../services/authentication-service/voters.api";
import type { VoterRegistration } from "../../services/authentication-service/voters.types";

vi.mock("../../api/apiClient", () => ({ apiClient: { get: vi.fn(), patch: vi.fn() } }));

const registration = (overrides: Partial<VoterRegistration> = {}): VoterRegistration => ({
  userId: "u1",
  username: "ana",
  email: "ana@example.com",
  emailVerified: false,
  firstName: "Ana",
  lastName: "López",
  matricula: "2026123456",
  matriculaValid: true,
  enabled: true,
  registeredAt: "2026-11-01T10:00:00Z",
  status: "PENDING",
  ...overrides,
});

const rejection = (code: string, status = 409) => ({
  isAxiosError: true,
  response: { status, data: { code } },
});

const renderDialog = (value: VoterRegistration) => {
  const handlers = { onClose: vi.fn(), onApproved: vi.fn(), onStale: vi.fn() };
  render(<VoterReviewDialog registration={value} {...handlers} />);
  return handlers;
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("VoterReviewDialog", () => {
  it("muestra la matrícula y aprueba asignando el rol", async () => {
    const approved = registration({ status: "APPROVED" });
    const approve = vi.spyOn(votersApi, "approve").mockResolvedValue(approved);
    const { onApproved } = renderDialog(registration());

    expect(screen.getByText("2026123456")).toBeInTheDocument();
    expect(screen.getByText("El correo aún no está verificado")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Aprobar como votante" }));

    expect(approve).toHaveBeenCalledWith("u1");
    expect(onApproved).toHaveBeenCalledWith(approved);
  });

  it("no permite aprobar una matrícula inválida o una cuenta deshabilitada", () => {
    renderDialog(registration({ matricula: "123", matriculaValid: false }));
    expect(screen.getByRole("button", { name: "Aprobar como votante" })).toBeDisabled();
  });

  it("informa el motivo del rechazo y refresca la lista si ya estaba aprobado", async () => {
    vi.spyOn(votersApi, "approve").mockRejectedValue(rejection("ALREADY_APPROVED"));
    const { onApproved, onStale } = renderDialog(registration());

    await userEvent.click(screen.getByRole("button", { name: "Aprobar como votante" }));

    expect(await screen.findByText("Esta cuenta ya había sido aprobada como votante.")).toBeInTheDocument();
    expect(onStale).toHaveBeenCalled();
    expect(onApproved).not.toHaveBeenCalled();
  });

  it("un votante aprobado solo muestra su detalle", () => {
    renderDialog(registration({ status: "APPROVED" }));
    expect(screen.queryByRole("button", { name: "Aprobar como votante" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeEnabled();
  });
});

describe("getApprovalErrorMessage", () => {
  it("traduce los motivos del backend", () => {
    expect(getApprovalErrorMessage(rejection("DUPLICATE_MATRICULA"))).toMatch(/Otro votante/);
    expect(getApprovalErrorMessage(rejection("INVALID_MATRICULA", 422))).toMatch(/10 dígitos/);
    expect(getApprovalErrorMessage({ isAxiosError: true, response: { status: 404, data: {} } })).toMatch(/ya no existe/);
  });
});
