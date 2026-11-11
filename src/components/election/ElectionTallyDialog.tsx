import OperationDialog from "../OperationDialog";
import useElectionOperation from "../../hooks/election-service/useElectionOperation";
import { buildTallySteps } from "../../services/election-service/election-lifecycle";
import type { ElectionDetails } from "../../services/election-service/election.types";

type ElectionTallyDialogProps = {
  open: boolean;
  election: ElectionDetails;
  /** Se invoca al cerrar el diálogo; `changed` indica que el estado de la elección pudo cambiar. */
  onClose: (changed: boolean) => void;
};

/** Confirma y ejecuta el escrutinio de una elección cerrada. */
function ElectionTallyDialog({ open, election, onClose }: ElectionTallyDialogProps) {
  const { phase, steps, run, reset } = useElectionOperation();

  const handleConfirm = () => {
    void run(buildTallySteps(election.electionId));
  };

  const handleClose = () => {
    // Aunque la respuesta sea un error, el backend pudo terminar el conteo: se recarga si hubo algún intento.
    const changed = steps.length > 0;
    reset();
    onClose(changed);
  };

  return (
    <OperationDialog
      open={open}
      title="Contabilizar votos"
      description="El escrutinio suma los votos cifrados del tablón público y descifra únicamente el total de cada candidatura."
      fromStatus={election.status}
      toStatus="FINISHED"
      requirements={[
        { label: "La elección está cerrada", met: election.status === "CLOSED" },
        { label: "Tu cuenta tiene el rol de autoridad electoral" },
      ]}
      consequences={[
        "La elección pasará de Cerrada a Finalizada.",
        "Los resultados quedarán guardados y disponibles para todos los roles.",
        "El conteo solo puede realizarse una vez.",
      ]}
      steps={steps}
      phase={phase}
      confirmLabel="Contabilizar votos"
      retryLabel="Reintentar conteo"
      successMessage="El conteo finalizó correctamente. Al cerrar esta ventana podrás consultar la gráfica con el botón «Ver resultados finales»."
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}

export default ElectionTallyDialog;
