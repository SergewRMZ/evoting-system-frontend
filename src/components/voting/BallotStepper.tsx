import { useState } from "react";
import { ArrowBack, ArrowForward, FactCheckOutlined } from "@mui/icons-material";
import { Box, Button, Stack, Step, StepLabel, Stepper, Typography } from "@mui/material";
import type { ElectionPosition } from "../../services/election-service/election.types";
import PositionSection from "./PositionSection";

type BallotStepperProps = {
  positions: ElectionPosition[];
  selections: Record<string, string>;
  onSelect: (electionPositionId: string, candidacyId: string) => void;
  /** Se llama al terminar el último cargo, con todos los cargos seleccionados. */
  onComplete: () => void;
  /** Cargo con el que inicia, por ejemplo el último al volver de la revisión. */
  initialIndex?: number;
};

/**
 * Boleta en forma de carrusel: muestra un cargo a la vez y no deja avanzar hasta
 * elegir una candidatura. Así el votante revisa cada cargo por separado, en lugar
 * de recorrer la página y marcar opciones sin verlas.
 */
function BallotStepper({ positions, selections, onSelect, onComplete, initialIndex = 0 }: BallotStepperProps) {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(positions.length - 1, 0)),
  );
  const position = positions[activeIndex];
  if (!position) return null;

  const isLast = activeIndex === positions.length - 1;
  const hasSelection = Boolean(selections[position.electionPositionId]);

  return (
    <Box>
      {positions.length > 1 && (
        <Stepper activeStep={activeIndex} alternativeLabel sx={{ mb: 3 }}>
          {positions.map((item, index) => (
            <Step key={item.electionPositionId} completed={index < activeIndex}>
              <StepLabel>{item.positionName}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Cargo {activeIndex + 1} de {positions.length}
      </Typography>

      <PositionSection
        key={position.electionPositionId}
        position={position}
        selectedCandidateId={selections[position.electionPositionId]}
        onCandidacySelect={onSelect}
      />

      <Stack direction="row" sx={{ mt: 3, justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => setActiveIndex((index) => index - 1)}
          disabled={activeIndex === 0}
        >
          Anterior
        </Button>
        {!hasSelection && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            Elige una candidatura para continuar.
          </Typography>
        )}
        <Button
          variant="contained"
          endIcon={isLast ? <FactCheckOutlined /> : <ArrowForward />}
          onClick={() => (isLast ? onComplete() : setActiveIndex((index) => index + 1))}
          disabled={!hasSelection}
        >
          {isLast ? "Revisar mi voto" : "Siguiente cargo"}
        </Button>
      </Stack>
    </Box>
  );
}

export default BallotStepper;
