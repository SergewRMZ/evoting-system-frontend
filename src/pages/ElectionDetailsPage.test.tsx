import { useMemo, useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authorizationServiceApi from "../services/authorization-service/authorization.api";
import tallyServiceApi from "../services/tally-service/tally-service.api";
import type { ElectionStatus } from "../services/election-service/election.types";
import ElectionDetailsPage from "./ElectionDetailsPage";

vi.mock("../components/Navbar", () => ({ default: () => null }));
vi.mock("../auth/useKeycloak", () => ({
  useKeycloak: () => ({ roles: ["ROLE_AUTHORITY"] }),
}));
vi.mock("../services/tally-service/tally-service.api", () => ({
  default: { tallyElection: vi.fn(), getPublicKey: vi.fn() },
}));
vi.mock("../services/authorization-service/authorization.api", () => ({
  default: { getKeys: vi.fn() },
}));
// Simula la recarga real: tras el conteo, el backend devuelve la elección en FINISHED.
vi.mock("../hooks/election-service/useElectionDetails", () => ({
  default: function useElectionDetailsMock() {
    const [status, setStatus] = useState<ElectionStatus>("CLOSED");
    const election = useMemo(
      () => ({
        electionId: "e1",
        name: "Elección de prueba",
        description: "Descripción",
        startDate: "2026-11-01T10:00:00Z",
        endDate: "2026-11-01T12:00:00Z",
        status,
        positions: [],
      }),
      [status],
    );
    return {
      election,
      loading: false,
      error: null,
      reload: async () => setStatus("FINISHED"),
    };
  },
}));

const tally = vi.mocked(tallyServiceApi.tallyElection);

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/vote/e1"]}>
      <Routes>
        <Route path="/vote/:electionId" element={<ElectionDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(tallyServiceApi.getPublicKey).mockResolvedValue({ publicKey: "clave", status: "ACTIVE" } as never);
  vi.mocked(authorizationServiceApi.getKeys).mockResolvedValue({ publicKey: { n: "modulo" }, keyStatus: "ACTIVE" } as never);
});

describe("conteo de votos desde el detalle", () => {
  it("pide confirmación antes de contar y después ofrece ver los resultados", async () => {
    tally.mockResolvedValue([]);
    renderPage();

    expect(screen.queryByRole("link", { name: "Ver resultados finales" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Contabilizar votos" }));
    const dialog = await screen.findByRole("dialog");
    expect(tally).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole("button", { name: "Contabilizar votos" }));
    await waitFor(() => expect(tally).toHaveBeenCalledWith("e1"));

    await userEvent.click(await within(dialog).findByRole("button", { name: "Cerrar" }));

    const link = await screen.findByRole("link", { name: "Ver resultados finales" });
    expect(link).toHaveAttribute("href", "/vote/e1/results");
    expect(screen.queryByRole("button", { name: "Contabilizar votos" })).not.toBeInTheDocument();
  });

  it("no cuenta los votos si la autoridad cancela", async () => {
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Contabilizar votos" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(tally).not.toHaveBeenCalled();
  });

  it("muestra el error y permite reintentar si el conteo falla", async () => {
    tally.mockRejectedValue({ isAxiosError: true, response: { status: 500, data: {} } });
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Contabilizar votos" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Contabilizar votos" }));

    expect(await within(dialog).findByRole("button", { name: "Reintentar conteo" })).toBeInTheDocument();
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Ocurrió un error interno al procesar el escrutinio");
  });
});
