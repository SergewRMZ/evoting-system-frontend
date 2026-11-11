import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { ElectionPosition } from "../../services/election-service/election.types";
import BallotStepper from "./BallotStepper";

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

const positions = [
  position("dir", "Director General", ["Laura", "Ricardo"]),
  position("con", "Alumno Consejero", ["Diego", "Valeria"]),
];

function Harness({ onComplete }: { onComplete: () => void }) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  return (
    <BallotStepper
      positions={positions}
      selections={selections}
      onSelect={(positionId, candidacyId) =>
        setSelections((current) => ({ ...current, [positionId]: candidacyId }))
      }
      onComplete={onComplete}
    />
  );
}

describe("BallotStepper", () => {
  it("muestra un cargo a la vez", () => {
    render(<Harness onComplete={vi.fn()} />);
    expect(screen.getByText("Cargo 1 de 2")).toBeInTheDocument();
    expect(screen.getByText(/Laura/)).toBeInTheDocument();
    expect(screen.queryByText(/Diego/)).not.toBeInTheDocument();
  });

  it("no deja avanzar sin elegir una candidatura", () => {
    render(<Harness onComplete={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Siguiente cargo/ })).toBeDisabled();
  });

  it("avanza al elegir y termina en el último cargo", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);

    await user.click(screen.getByText(/Ricardo/));
    await user.click(screen.getByRole("button", { name: /Siguiente cargo/ }));
    expect(screen.getByText("Cargo 2 de 2")).toBeInTheDocument();

    const review = screen.getByRole("button", { name: /Revisar mi voto/ });
    expect(review).toBeDisabled();
    await user.click(screen.getByText(/Valeria/));
    await user.click(review);
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
