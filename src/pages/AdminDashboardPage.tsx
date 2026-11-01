import { useState } from "react";
import { Add, ArrowForward, HowToVoteOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useElections from "../hooks/election-service/useElections";
import ElectionStatusChip from "../components/election/ElectionStatusChip";
import ElectionFormDialog from "../components/election/ElectionFormDialog";
import type { CreateElectionRequest } from "../services/election-service/election.types";
import electionServiceApi from "../services/election-service/election.api";
import { getApiErrorMessage } from "../errors/apiErrorMap";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { elections, loading, error } = useElections();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const createElection = async (request: CreateElectionRequest) => {
    try {
      const created = await electionServiceApi.createElection(request);
      setCreateDialogOpen(false);
      navigate(`/admin/elections/${created.electionId}`);
    } catch (createError) {
      throw new Error(getApiErrorMessage(createError, "election", "No se pudo crear la elección."), { cause: createError });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Typography variant="overline" color="secondary.main">ADMINISTRACIÓN</Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: "2.3rem", md: "3.5rem" }, mt: 1 }}>
          Gestión de elecciones
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Organiza los procesos electorales y revisa su configuración en un solo lugar.
        </Typography>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderColor: "divider", mb: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Inicia una nueva elección</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Primero guardarás los datos básicos; después podrás configurar cargos y candidaturas.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
              Nueva elección
            </Button>
          </Stack>
        </Paper>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
          <HowToVoteOutlined color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Procesos electorales</Typography>
        </Stack>
        {error && <Alert severity="error">{error.message}</Alert>}
        {!error && !loading && elections.length === 0 && (
          <Alert severity="info">Aún no hay elecciones registradas.</Alert>
        )}
        <Stack spacing={1.5}>
          {elections.map((election) => (
            <Paper key={election.electionId} variant="outlined" sx={{ p: 2.5, borderColor: "divider" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h6">{election.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <ElectionStatusChip status={election.status} size="small" sx={{ mr: 1 }} />
                    {new Date(election.startDate).toLocaleString("es-MX")}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button component={RouterLink} to={`/vote/${election.electionId}`} variant="outlined">Ver detalle</Button>
                  {election.status === "DRAFT" ? (
                    <Button component={RouterLink} to={`/admin/elections/${election.electionId}`} endIcon={<ArrowForward />}>
                      Configurar
                    </Button>
                  ) : (
                    <Button disabled>Configuración cerrada</Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>

      <ElectionFormDialog
        open={createDialogOpen}
        mode="create"
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={createElection}
      />
    </Box>
  );
}

export default AdminDashboardPage;
