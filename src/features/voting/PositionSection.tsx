import { Alert, Grid, Paper, Stack, Typography } from "@mui/material";
import type { ElectionPosition } from "../elections/electionTypes";
import CandidateCard from "./CandidateCard";

type PositionSectionProps = {
  position: ElectionPosition;
  selectedCandidateId?: string;
  onCandidateSelect: (
    electionPositionId: string,
    candidateId: string,
  ) => void;
};

function PositionSection({
  position,
  selectedCandidateId,
  onCandidateSelect,
}: PositionSectionProps) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 4 },
        border: "1px solid #eaecf0",
        boxShadow: "0 4px 16px rgba(16,24,40,.04)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: { sm: "center" },
        }}
      >
        <div>
          <Typography variant="h5">{position.positionName}</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Selecciona una candidatura para este puesto
          </Typography>
        </div>
        <Typography
          variant="body2"
          color={selectedCandidateId ? "primary.main" : "text.secondary"}
          sx={{ fontWeight: 700, mt: { xs: 1.5, sm: 0 } }}
        >
          {selectedCandidateId ? "1 seleccionada" : "Ninguna seleccionada"}
        </Typography>
      </Stack>

      {position.candidates.length === 0 ? (
        <Alert severity="info">
          Este puesto todavía no tiene candidatos registrados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {position.candidates.map((candidate, index) => (
            <Grid
              key={candidate.candidateId}
              size={{ xs: 12, md: 4 }}
            >
              <CandidateCard
                candidate={candidate}
                colorIndex={index}
                selected={selectedCandidateId === candidate.candidateId}
                onSelect={(candidateId) =>
                  onCandidateSelect(position.electionPositionId, candidateId)
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}

export default PositionSection;
