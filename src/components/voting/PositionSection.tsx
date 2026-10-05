import { Alert, Grid, Paper, Stack, Typography } from "@mui/material";
import type { ElectionPosition } from "../../services/election-service/election.types";
import CandidateCard from "./CandidateCard";

type PositionSectionProps = {
  position: ElectionPosition;
  selectedCandidateId?: string;
  onCandidacySelect: (
    electionPositionId: string,
    candidateId: string,
  ) => void;
};

function PositionSection({
  position,
  selectedCandidateId,
  onCandidacySelect,
}: PositionSectionProps) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 4 },
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 12px 32px rgba(0,0,0,.12)",
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
            Selecciona como máximo una candidatura para este puesto
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

      {position.candidacies.length === 0 ? (
        <Alert severity="info">
          Este puesto todavía no tiene candidatos registrados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {position.candidacies.map((candidacy, index) => (
            <Grid
              key={candidacy.candidacyId}
              size={{ xs: 12, md: 4 }}
            >
              <CandidateCard
                candidacy={candidacy}
                colorIndex={index}
                selected={selectedCandidateId === candidacy.candidacyId}
                onSelect={(candidacyId) =>
                  onCandidacySelect(position.electionPositionId, candidacyId)
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
