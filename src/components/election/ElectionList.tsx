import type { ReactNode } from "react";
import { ChevronRight } from "@mui/icons-material";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { Election } from "../../services/election-service/election.types";
import ElectionStatusChip from "./ElectionStatusChip";

const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

const formatElectionPeriod = (election: Pick<Election, "startDate" | "endDate">) =>
  `${dateFormatter.format(new Date(election.startDate))} – ${dateFormatter.format(new Date(election.endDate))}`;

type ElectionListProps = {
  elections: Election[];
  /** Destino al hacer clic en la fila. */
  linkTo: (election: Election) => string;
  /** Acciones adicionales a la derecha de cada fila. */
  actions?: (election: Election) => ReactNode;
};

/** Lista de elecciones en filas: nombre, periodo y estado. */
function ElectionList({ elections, linkTo, actions }: ElectionListProps) {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      {elections.map((election, index) => (
        <Box key={election.electionId}>
          {index > 0 && <Divider />}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ px: { xs: 2, sm: 2.5 }, py: 2, alignItems: { sm: "center" }, "&:hover": { bgcolor: "action.hover" } }}
          >
            <Box
              component={RouterLink}
              to={linkTo(election)}
              sx={{
                flex: 1,
                minWidth: 0,
                color: "inherit",
                textDecoration: "none",
                borderRadius: 1,
                "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 4 },
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>{election.name}</Typography>
                <ElectionStatusChip status={election.status} size="small" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatElectionPeriod(election)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
              {actions?.(election)}
              <ChevronRight sx={{ color: "text.disabled", display: { xs: "none", sm: "block" } }} />
            </Stack>
          </Stack>
        </Box>
      ))}
    </Paper>
  );
}

export default ElectionList;
