import { Chip, Paper, Stack, Typography } from "@mui/material";
import type { Election, ElectionStatus } from "../elections/electionTypes";

const electionStatusLabels: Record<ElectionStatus, string> = {
  CREATED: "Creada",
  VERIFIED: "Verificada",
  ACTIVE: "Activa",
  CLOSED: "Cerrada",
  FINISHED: "Finalizada",
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
});

function formatElectionDate(value: string) {
  return `${dateFormatter.format(new Date(value))} UTC`;
}

type ElectionSummaryProps = {
  election: Election;
};

function ElectionSummary({ election }: ElectionSummaryProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={3}
      sx={{ mb: 4, justifyContent: "space-between" }}
    >
      <div>
        <Typography
          variant="overline"
          sx={{
            color: "secondary.main",
            fontWeight: 700,
            letterSpacing: ".12em",
          }}
        >
          ELECCIÓN
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 1, alignItems: { sm: "center" } }}
        >
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: "2.3rem", md: "3.4rem" } }}
          >
            {election.name}
          </Typography>
          <Chip
            label={electionStatusLabels[election.status]}
            color={election.status === "ACTIVE" ? "success" : "default"}
          />
        </Stack>
        <Typography
          color="text.secondary"
          sx={{ mt: 1.5, fontSize: "1.05rem" }}
        >
          {election.description}
        </Typography>
      </div>

      <Paper
        variant="outlined"
        sx={{ p: 2, minWidth: { md: 280 }, alignSelf: { md: "end" }, borderColor: "divider", bgcolor: "background.paper" }}
      >
        <Typography variant="body2" color="text.secondary">
          Periodo de la elección (UTC)
        </Typography>
        <Typography sx={{ mt: 0.75, fontWeight: 600 }}>
          {formatElectionDate(election.startDate)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ my: 0.25 }}>
          hasta
        </Typography>
        <Typography sx={{ fontWeight: 600 }}>
          {formatElectionDate(election.endDate)}
        </Typography>
      </Paper>
    </Stack>
  );
}

export default ElectionSummary;
