import { Step, StepLabel, Stepper } from "@mui/material";
import type { ElectionStatus } from "../../services/election-service/election.types";
import { LIFECYCLE_STAGES, getStageIndex, getStatusLabel } from "../../utils/electionStatus";

type ElectionLifecycleStepperProps = {
  status: ElectionStatus;
};

/** Muestra en qué etapa del ciclo de vida se encuentra la elección. */
function ElectionLifecycleStepper({ status }: ElectionLifecycleStepperProps) {
  const activeIndex = getStageIndex(status);
  // FINISHED es la última etapa: se considera completada.
  const allDone = status === "FINISHED";

  return (
    <Stepper
      activeStep={activeIndex}
      alternativeLabel
      aria-label="Ciclo de vida de la elección"
      sx={{ "& .MuiStepLabel-label": { fontSize: { xs: "0.7rem", sm: "0.875rem" } } }}
    >
      {LIFECYCLE_STAGES.map((stage, index) => (
        <Step key={stage} completed={allDone || index < activeIndex}>
          <StepLabel>{getStatusLabel(stage)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export default ElectionLifecycleStepper;
