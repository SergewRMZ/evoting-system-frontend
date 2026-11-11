import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authorizationServiceApi from "../../services/authorization-service/authorization.api";
import tallyServiceApi from "../../services/tally-service/tally-service.api";
import type { ElectionDetails, ElectionStatus } from "../../services/election-service/election.types";
import ElectionKeysPanel from "./ElectionKeysPanel";

vi.mock("../../services/authorization-service/authorization.api", () => ({
  default: { getKeys: vi.fn() },
}));
vi.mock("../../services/tally-service/tally-service.api", () => ({
  default: { getPublicKey: vi.fn() },
}));

const getAuthKeys = vi.mocked(authorizationServiceApi.getKeys);
const getEncryptionKey = vi.mocked(tallyServiceApi.getPublicKey);

const httpError = (status: number) => ({ isAxiosError: true, response: { status, data: {} } });

const electionWith = (status: ElectionStatus) =>
  ({ electionId: "e1", status, positions: [] }) as unknown as ElectionDetails;

const modulus = `${"a".repeat(16)}${"m".repeat(320)}${"z".repeat(12)}`;

const authKey = (keyStatus: "CREATED" | "ACTIVE" | "EXPIRED") =>
  ({ publicKey: { kty: "RSA", n: modulus, e: "AQAB" }, keyStatus }) as never;
const encryptionKey = (status: "CREATED" | "ACTIVE" | "EXPIRED") =>
  ({ publicKey: "AjFxS2tleUNvcnRh", status }) as never;

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ElectionKeysPanel", () => {
  it("no consulta ni muestra nada antes de la validación", () => {
    const { container } = render(<ElectionKeysPanel election={electionWith("PUBLISHED")} />);
    expect(container).toBeEmptyDOMElement();
    expect(getAuthKeys).not.toHaveBeenCalled();
    expect(getEncryptionKey).not.toHaveBeenCalled();
  });

  it("muestra abreviada la clave de autorización y completa la de cifrado, con su estado", async () => {
    getAuthKeys.mockResolvedValue(authKey("CREATED"));
    getEncryptionKey.mockResolvedValue(encryptionKey("ACTIVE"));

    render(<ElectionKeysPanel election={electionWith("VERIFIED")} />);

    expect(await screen.findByText(`${"a".repeat(16)}…${"z".repeat(12)}`)).toBeInTheDocument();
    expect(screen.queryByText(modulus)).not.toBeInTheDocument();
    expect(screen.getByText("AjFxS2tleUNvcnRh")).toBeInTheDocument();
    expect(screen.getByText("Creada")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();
  });

  it("indica qué clave falta por generar cuando el servicio responde 404", async () => {
    getAuthKeys.mockResolvedValue(authKey("EXPIRED"));
    getEncryptionKey.mockRejectedValue(httpError(404));

    render(<ElectionKeysPanel election={electionWith("VERIFIED")} />);

    expect(await screen.findByText("Sin generar")).toBeInTheDocument();
    expect(screen.getByText("Expirada")).toBeInTheDocument();
  });

  it("permite reintentar la consulta si un servicio falla", async () => {
    getAuthKeys.mockRejectedValueOnce(httpError(500)).mockResolvedValue(authKey("ACTIVE"));
    getEncryptionKey.mockResolvedValue(encryptionKey("ACTIVE"));

    render(<ElectionKeysPanel election={electionWith("ACTIVE")} />);

    await userEvent.click(await screen.findByRole("button", { name: "Reintentar" }));

    await waitFor(() => expect(screen.getAllByText("Activa")).toHaveLength(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("vuelve a consultar las claves al recargar la elección aunque no cambie su estado", async () => {
    getAuthKeys.mockResolvedValue(authKey("CREATED"));
    getEncryptionKey.mockRejectedValueOnce(httpError(404)).mockResolvedValue(encryptionKey("CREATED"));

    const { rerender } = render(<ElectionKeysPanel election={electionWith("VERIFIED")} />);
    await screen.findByText("Sin generar");

    rerender(<ElectionKeysPanel election={electionWith("VERIFIED")} />);

    expect(await screen.findByText("AjFxS2tleUNvcnRh")).toBeInTheDocument();
    expect(screen.queryByText("Sin generar")).not.toBeInTheDocument();
  });
});
