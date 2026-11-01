import OperationDialog, { type OperationRequirement } from "../OperationDialog";
import useElectionOperation from "../../hooks/election-service/useElectionOperation";
import { buildValidationSteps } from "../../services/election-service/election-lifecycle";
import type { ElectionDetails } from "../../services/election-service/election.types";
import { isElectionReadyToPublish } from "../../utils/electionStatus";

type ElectionValidationDialogProps = {
  open: boolean;
  election: ElectionDetails;
  /** Se invoca al cerrar el diálogo; `changed` indica que el estado de la elección pudo cambiar. */
  onClose: (changed: boolean) => void;
};

/** Confirma y ejecuta la validación de una elección, incluida la generación de sus claves. */
function ElectionValidationDialog({ open, election, onClose }: ElectionValidationDialogProps) {
  const { phase, steps, run, reset } = useElectionOperation();
  const resuming = election.status === "VERIFIED";

  const requirements: OperationRequirement[] = [
    {
      label: resuming ? "La elección ya está validada" : "La elección está publicada",
      met: election.status === "PUBLISHED" || resuming,
    },
    {
      label: "Todos los cargos tienen al menos una candidatura",
      met: isElectionReadyToPublish(election),
    },
    { label: "Tu cuenta tiene el rol de autoridad electoral" },
  ];

  const handleConfirm = () => {
    void run(buildValidationSteps(election.electionId, election.status));
  };

  const handleClose = () => {
    const changed = steps.some((step) => step.status === "done");
    reset();
    onClose(changed);
  };

  return (
    <OperationDialog
      open={open}
      title={resuming ? "Completar claves criptográficas" : "Validar elección"}
      description={
        resuming
          ? "La elección ya fue validada, pero faltan claves criptográficas por generar. Solo se crearán las que no existan; las existentes no se reemplazan."
          : "Validar confirma que los cargos y candidaturas registrados son correctos y prepara la elección para su activación. Durante este proceso se ejecutan las operaciones criptográficas de la elección."
      }
      fromStatus={election.status}
      toStatus="VERIFIED"
      requirements={requirements}
      consequences={[
        "La elección pasará de Publicada a Validada y dejará de poder modificarse.",
        "Se generarán el par de claves de cifrado y el par de claves de autorización (firma ciega) de esta elección.",
        "Las claves se generan una sola vez: repetir la operación no las reemplaza.",
        "Este paso no activa la elección ni habilita la votación.",
      ]}
      steps={steps}
      phase={phase}
      confirmLabel={resuming ? "Completar claves" : "Validar y generar claves"}
      successMessage="La elección fue validada y sus claves criptográficas están listas. Ya puede activarse."
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}

export default ElectionValidationDialog;
