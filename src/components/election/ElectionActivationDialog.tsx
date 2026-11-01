import OperationDialog, { type OperationRequirement } from "../OperationDialog";
import useElectionOperation from "../../hooks/election-service/useElectionOperation";
import { buildActivationSteps } from "../../services/election-service/election-lifecycle";
import type { ElectionDetails } from "../../services/election-service/election.types";

type ElectionActivationDialogProps = {
  open: boolean;
  election: ElectionDetails;
  /** Instante (ms) en que se abrió el diálogo, para comprobar el periodo de la elección. */
  openedAt: number;
  /** Se invoca al cerrar el diálogo; `changed` indica que el estado de la elección pudo cambiar. */
  onClose: (changed: boolean) => void;
};

/** Confirma y ejecuta la activación de una elección ya validada. */
function ElectionActivationDialog({ open, election, openedAt, onClose }: ElectionActivationDialogProps) {
  const { phase, steps, run, reset } = useElectionOperation();
  const resuming = election.status === "ACTIVE";
  const withinPeriod =
    openedAt >= new Date(election.startDate).getTime() && openedAt <= new Date(election.endDate).getTime();

  const requirements: OperationRequirement[] = [
    {
      label: resuming ? "La elección ya está activa" : "La elección está validada y tiene sus claves generadas",
      met: election.status === "VERIFIED" || resuming,
    },
    {
      label: "La fecha y hora actuales están dentro del periodo de la elección",
      met: withinPeriod,
      // El backend tiene la última palabra sobre el horario; aquí solo se advierte.
      blocking: false,
    },
  ];

  const handleConfirm = () => {
    void run(buildActivationSteps(election.electionId, election.status));
  };

  const handleClose = () => {
    const changed = steps.some((step) => step.status === "done");
    reset();
    onClose(changed);
  };

  return (
    <OperationDialog
      open={open}
      title={resuming ? "Completar activación de claves" : "Activar elección"}
      description={
        resuming
          ? "La elección ya está activa, pero falta habilitar alguna de sus claves para que los votantes puedan votar. Solo se habilitarán las claves que sigan pendientes."
          : "Activar cambia el estado de la elección y permite que reciba votos. No genera claves nuevas: habilita las claves creadas durante la validación."
      }
      fromStatus={election.status}
      toStatus="ACTIVE"
      requirements={requirements}
      consequences={[
        "La elección pasará de Validada a Activa y los votantes podrán emitir su voto.",
        "Se habilitarán las claves de autorización y de cifrado que ya existen; no se generan claves nuevas.",
        "La elección se cerrará automáticamente al llegar su fecha de finalización.",
      ]}
      steps={steps}
      phase={phase}
      confirmLabel={resuming ? "Completar activación" : "Activar elección"}
      successMessage="La elección está activa y lista para recibir votos."
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}

export default ElectionActivationDialog;
