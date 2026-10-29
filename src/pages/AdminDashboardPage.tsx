import { useState } from "react";
import type { FormEvent } from "react";
import { Add, ArrowForward, HowToVoteOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useElections from "../hooks/election-service/useElections";
import electionServiceApi from "../services/election-service/election.api";
import { getApiErrorMessage } from "../utils/apiError";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { elections, loading, error } = useElections();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const createElection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!name.trim() || !description.trim()) {
      setFormError("Completa el nombre y la descripción de la elección.");
      return;
    }
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      setFormError("La fecha de inicio debe ser anterior a la fecha de finalización.");
      return;
    }

    setCreating(true);
    try {
      const created = await electionServiceApi.createElection({
        name: name.trim(),
        description: description.trim(),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      setCreateDialogOpen(false);
      navigate(`/admin/elections/${created.electionId}`);
    } catch (createError) {
      setFormError(getApiErrorMessage(createError, "No se pudo crear la elección."));
    } finally {
      setCreating(false);
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
                    <Chip size="small" label={election.status === "DRAFT" ? "Borrador" : election.status} sx={{ mr: 1 }} />
                    {new Date(election.startDate).toLocaleString("es-MX")}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button component={RouterLink} to={`/vote/${election.electionId}`} variant="outlined">Ver detalle</Button>
                  <Button component={RouterLink} to={`/admin/elections/${election.electionId}`} endIcon={<ArrowForward />}>
                    Configurar
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>

      <Dialog open={createDialogOpen} onClose={() => !creating && setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={createElection}>
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="overline" color="secondary.main">NUEVA ELECCIÓN · PASO 1 DE 2</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>Datos generales</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Al continuar, la elección se guardará como borrador. En el siguiente paso podrás añadir cargos y candidaturas antes de publicarla.
            </Typography>
            <Stack spacing={2}>
              <TextField autoFocus label="Nombre de la elección" value={name} onChange={(event) => setName(event.target.value)} required />
              <TextField label="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} required multiline minRows={3} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Inicio" type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} required slotProps={{ inputLabel: { shrink: true } }} fullWidth />
                <TextField label="Finalización" type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} required slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              </Stack>
              {formError && <Alert severity="error">{formError}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>Cancelar</Button>
            <Button type="submit" variant="contained" startIcon={<Add />} disabled={creating}>
              {creating ? "Creando..." : "Crear y continuar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

export default AdminDashboardPage;
