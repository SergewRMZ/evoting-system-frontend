import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import OperationDialog from "./OperationDialog";
import type { OperationStep } from "../services/election-service/election-lifecycle";

const steps: OperationStep[] = [
  { id: "a", label: "Primer paso", status: "done" },
  { id: "b", label: "Segundo paso", status: "pending" },
];

const renderDialog = (props: Partial<ComponentProps<typeof OperationDialog>> = {}) => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <OperationDialog
      open
      title="Validar elección"
      description="Explicación"
      fromStatus="PUBLISHED"
      toStatus="VERIFIED"
      requirements={[{ label: "Requisito A", met: true }]}
      consequences={["Consecuencia uno"]}
      steps={[]}
      phase="idle"
      confirmLabel="Validar"
      successMessage="Todo bien"
      onConfirm={onConfirm}
      onClose={onClose}
      {...props}
    />,
  );
  return { onConfirm, onClose };
};

describe("OperationDialog", () => {
  it("muestra requisitos, consecuencias y estados antes de confirmar", async () => {
    const { onConfirm } = renderDialog();

    expect(screen.getByText("Requisito A")).toBeInTheDocument();
    expect(screen.getByText("Consecuencia uno")).toBeInTheDocument();
    expect(screen.getByText("Publicada")).toBeInTheDocument();
    expect(screen.getByText("Validada")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Validar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("bloquea la confirmación si un requisito obligatorio no se cumple", () => {
    renderDialog({ requirements: [{ label: "Falta algo", met: false }] });
    expect(screen.getByRole("button", { name: "Validar" })).toBeDisabled();
  });

  it("solo advierte cuando el requisito incumplido no es bloqueante", () => {
    renderDialog({ requirements: [{ label: "Horario", met: false, blocking: false }] });
    expect(screen.getByRole("button", { name: "Validar" })).toBeEnabled();
  });

  it("mientras procesa deshabilita confirmar y cancelar para evitar duplicados", async () => {
    const { onClose } = renderDialog({ phase: "running", steps });

    expect(screen.getByRole("button", { name: /Procesando/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByText("Primer paso")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("informa el error y ofrece reintentar los pasos pendientes", () => {
    const failed: OperationStep[] = [
      steps[0],
      { id: "b", label: "Segundo paso", status: "error", error: "Servicio no disponible" },
    ];
    renderDialog({ phase: "error", steps: failed });

    expect(screen.getAllByText(/Servicio no disponible/).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Reintentar pasos pendientes" })).toBeEnabled();
  });

  it("confirma el éxito y solo ofrece cerrar", async () => {
    const done = steps.map((step) => ({ ...step, status: "done" as const }));
    const { onClose } = renderDialog({ phase: "success", steps: done });

    expect(screen.getByText("Todo bien")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Validar" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
