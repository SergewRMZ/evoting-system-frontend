import { useState } from "react";
import { Add } from "@mui/icons-material";
import { Alert, Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PageHeader, PageLayout } from "../components/layout/PageLayout";
import ElectionList from "../components/election/ElectionList";
import useElections from "../hooks/election-service/useElections";
import ElectionFormDialog from "../components/election/ElectionFormDialog";
import type { CreateElectionRequest } from "../services/election-service/election.types";
import electionServiceApi from "../services/election-service/election.api";
import { getApiErrorMessage } from "../errors/apiErrorMap";
import { isElectionEditable } from "../utils/electionStatus";

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
    <PageLayout>
      <PageHeader
        eyebrow="Administración"
        title="Elecciones"
        description="Crea elecciones, configura sus cargos y candidaturas, y publícalas para su validación."
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
            Nueva elección
          </Button>
        }
      />

      {error && <Alert severity="error">{error.message}</Alert>}
      {!error && !loading && elections.length === 0 && (
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
          <Typography variant="h6">Aún no hay elecciones</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Empieza por crear una elección; después podrás añadir cargos y candidaturas.
          </Typography>
        </Paper>
      )}
      {elections.length > 0 && (
        <ElectionList
          elections={elections}
          linkTo={(election) => `/vote/${election.electionId}`}
          actions={(election) =>
            isElectionEditable(election.status) ? (
              <Button component={RouterLink} to={`/admin/elections/${election.electionId}`} size="small" variant="outlined" sx={{ color: "text.primary" }}>
                Configurar
              </Button>
            ) : null
          }
        />
      )}

      <ElectionFormDialog
        open={createDialogOpen}
        mode="create"
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={createElection}
      />
    </PageLayout>
  );
}

export default AdminDashboardPage;
