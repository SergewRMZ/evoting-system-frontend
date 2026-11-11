import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { ElectionPosition } from "../../services/election-service/election.types";
import type { ElectionTallyResult } from "../../services/tally-service/tally-service.types";
import { summarizePosition } from "../../utils/results";
import ResultsCarousel from "./ResultsCarousel";

const position = (id: string, name: string, candidates: string[]): ElectionPosition => ({
  electionPositionId: id,
  positionId: `p-${id}`,
  positionName: name,
  candidacies: candidates.map((candidate, index) => ({
    candidacyId: `${id}-c${index}`,
    candidate: {
      id: `${id}-cand${index}`,
      name: candidate,
      lastName: "Prueba",
      description: "",
      isActive: true,
      hasPhoto: false,
    },
  })),
});

const result = (positionId: string, candidacyId: string, votes: number): ElectionTallyResult => ({
  id: `${candidacyId}-r`,
  electionPositionId: positionId,
  candidacyId,
  result: votes,
  createdAt: "2026-11-10T00:00:00Z",
});

const positions = [
  position("dir", "Director General", ["Laura", "Ricardo"]),
  position("con", "Alumno Consejero", ["Diego", "Valeria"]),
];
const results = [
  result("dir", "dir-c0", 12),
  result("dir", "dir-c1", 30),
  result("con", "con-c0", 7),
  result("con", "con-c1", 7),
];

describe("summarizePosition", () => {
  it("conserva el orden de la boleta y marca al ganador", () => {
    const summary = summarizePosition(positions[0], results);
    expect(summary.candidates.map((c) => c.votes)).toEqual([12, 30]);
    expect(summary.total).toBe(42);
    expect([...summary.winners]).toEqual(["dir-c1"]);
  });

  it("marca a todos los empatados y a nadie si no hay votos", () => {
    expect(summarizePosition(positions[1], results).winners.size).toBe(2);
    expect(summarizePosition(positions[0], []).winners.size).toBe(0);
  });
});

describe("ResultsCarousel", () => {
  it("muestra un cargo a la vez con su ganador", () => {
    render(<ResultsCarousel positions={positions} results={results} durationMs={0} />);
    expect(screen.getByText("Cargo 1 de 2")).toBeInTheDocument();
    expect(screen.queryByText(/Diego/)).not.toBeInTheDocument();
    expect(screen.getByText("Ganador")).toBeInTheDocument();
    expect(screen.getByLabelText("30 votos")).toBeInTheDocument();
  });

  it("navega al siguiente cargo y muestra el empate", async () => {
    const user = userEvent.setup();
    render(<ResultsCarousel positions={positions} results={results} durationMs={0} />);
    await user.click(screen.getByRole("button", { name: "Cargo siguiente" }));
    expect(screen.getByText("Alumno Consejero")).toBeInTheDocument();
    expect(screen.getAllByText("Empate")).toHaveLength(2);
  });

  it("no revela al ganador antes de terminar el conteo", () => {
    render(<ResultsCarousel positions={positions} results={results} durationMs={60_000} />);
    expect(screen.queryByText("Ganador")).not.toBeInTheDocument();
  });
});
