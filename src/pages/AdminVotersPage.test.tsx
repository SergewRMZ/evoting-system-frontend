import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminVotersPage from "./AdminVotersPage";
import votersApi from "../services/authentication-service/voters.api";
import type { VoterRegistrationPage } from "../services/authentication-service/voters.types";

vi.mock("../api/apiClient", () => ({ apiClient: { get: vi.fn(), patch: vi.fn() } }));
vi.mock("../components/Navbar", () => ({ default: () => null }));

const page: VoterRegistrationPage = {
  content: [
    {
      userId: "u1",
      username: "ana",
      email: "ana@example.com",
      emailVerified: true,
      firstName: "Ana",
      lastName: "López",
      matricula: "2026123456",
      matriculaValid: true,
      enabled: true,
      registeredAt: "2026-11-01T10:00:00Z",
      status: "PENDING",
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  pendingCount: 1,
  approvedCount: 4,
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("AdminVotersPage", () => {
  it("lista las solicitudes pendientes con sus indicadores y permite revisarlas", async () => {
    const getRegistrations = vi.spyOn(votersApi, "getRegistrations").mockResolvedValue(page);
    render(<MemoryRouter><AdminVotersPage /></MemoryRouter>);

    const row = (await screen.findByText("Ana López")).closest("tr")!;
    expect(within(row).getByText("2026123456")).toBeInTheDocument();
    expect(within(row).getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Votantes aprobados").nextSibling).toHaveTextContent("4");
    expect(getRegistrations).toHaveBeenCalledWith(expect.objectContaining({ status: "PENDING", page: 0 }));

    await userEvent.click(within(row).getByRole("button", { name: "Revisar" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Revisar solicitud");
  });

  it("al cambiar a «Aprobados» consulta con ese filtro", async () => {
    const getRegistrations = vi.spyOn(votersApi, "getRegistrations").mockResolvedValue({ ...page, content: [], totalElements: 0 });
    render(<MemoryRouter><AdminVotersPage /></MemoryRouter>);

    await userEvent.click(await screen.findByRole("tab", { name: /Aprobados/ }));

    expect(getRegistrations).toHaveBeenLastCalledWith(expect.objectContaining({ status: "APPROVED" }));
    expect(await screen.findByText("Todavía no hay votantes aprobados.")).toBeInTheDocument();
  });
});
