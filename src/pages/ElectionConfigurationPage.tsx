import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowBack,
  CampaignOutlined,
  PersonAddAlt1Outlined,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingPage from "../components/LoadingPage";
import electionServiceApi from "../services/election-service/election.api";
import type {
  Candidate,
  CreateCandidateRequest,
  ElectionDetails,
  Position,
} from "../services/election-service/election.types";
import { getApiErrorMessage } from "../utils/apiError";

function ElectionConfigurationPage() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<ElectionDetails | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionsError, setPositionsError] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [newPositionName, setNewPositionName] = useState("");
  const [associatedPositionIds, setAssociatedPositionIds] = useState<string[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string[]>>({});
  const [associatedCandidateIds, setAssociatedCandidateIds] = useState<Record<string, string[]>>({});
  const [newCandidate, setNewCandidate] = useState<CreateCandidateRequest>({
    name: "",
    lastName: "",
    description: "",
  });

  const refreshElection = async () => {
    if (!electionId) return;
    setElection(await electionServiceApi.getElectionDetailsById(electionId));
  };

  useEffect(() => {
    if (!electionId) {
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      const [electionResult, positionsResult, candidatesResult] = await Promise.allSettled([
        electionServiceApi.getElectionDetailsById(electionId),
        electionServiceApi.getPositions(),
        electionServiceApi.getCandidates(),
      ]);
      if (!active) return;

      if (electionResult.status === "fulfilled") {
        setElection(electionResult.value);
      } else {
        setError(getApiErrorMessage(electionResult.reason, "No se pudo cargar la elección."));
      }

      if (positionsResult.status === "fulfilled") {
        setPositions(positionsResult.value);
        setPositionsError("");
      } else {
        setPositionsError(getApiErrorMessage(positionsResult.reason, "No se pudieron consultar los cargos existentes."));
      }

      if (candidatesResult.status === "fulfilled") {
        setCandidates(candidatesResult.value);
        setCandidateError("");
      } else {
        setCandidateError(getApiErrorMessage(candidatesResult.reason, "No se pudieron consultar los candidatos existentes."));
      }
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [electionId]);

  const associatePosition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!electionId || !selectedPositionId) return;
    if (election?.positions.some((position) => position.positionId === selectedPositionId) ||
      associatedPositionIds.includes(selectedPositionId)) {
      setSelectedPositionId("");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const associated = await electionServiceApi.associatePosition(electionId, selectedPositionId);
      setAssociatedPositionIds((current) => [...new Set([...current, associated.positionId])]);
      setSelectedPositionId("");
      setMessage("El cargo se asoció a la elección.");
      try {
        await refreshElection();
      } catch (refreshError) {
        setError(`El cargo se asoció, pero no se pudo actualizar el detalle: ${getApiErrorMessage(refreshError, "error desconocido")}`);
      }
    } catch (operationError) {
      setError(getApiErrorMessage(operationError, "No se pudo asociar el cargo."));
    } finally {
      setBusy(false);
    }
  };

  const createAndAssociatePosition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!electionId) return;
    if (!newPositionName.trim()) {
      setError("Escribe el nombre del cargo electoral.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const position = await electionServiceApi.createPosition(newPositionName.trim());
      setPositions((current) => [...current, position]);
      const associated = await electionServiceApi.associatePosition(electionId, position.id);
      setAssociatedPositionIds((current) => [...new Set([...current, associated.positionId])]);
      await refreshElection();
      setNewPositionName("");
      setMessage("El cargo se creó y se asoció a la elección.");
    } catch (operationError) {
      setError(getApiErrorMessage(operationError, "No se pudo crear o asociar el cargo."));
    } finally {
      setBusy(false);
    }
  };

  const createCandidate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCandidate.name.trim() || !newCandidate.lastName.trim() || !newCandidate.description.trim()) {
      setError("Completa el nombre, apellido y descripción del candidato.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const candidate = await electionServiceApi.createCandidate({
        name: newCandidate.name.trim(),
        lastName: newCandidate.lastName.trim(),
        description: newCandidate.description.trim(),
      });
      setCandidates((current) => [...current, candidate]);
      setNewCandidate({ name: "", lastName: "", description: "" });
      setMessage("El candidato se registró correctamente.");
    } catch (operationError) {
      setError(getApiErrorMessage(operationError, "No se pudo registrar el candidato."));
    } finally {
      setBusy(false);
    }
  };

  const addCandidacies = async (electionPositionId: string) => {
    const candidateIds = selectedCandidates[electionPositionId] ?? [];
    const alreadyAssociated = new Set([
      ...(election?.positions.find((position) => position.electionPositionId === electionPositionId)
        ?.candidacies.map((candidacy) => candidacy.candidate.id) ?? []),
      ...(associatedCandidateIds[electionPositionId] ?? []),
    ]);
    const newCandidateIds = candidateIds.filter((candidateId) => !alreadyAssociated.has(candidateId));
    if (newCandidateIds.length === 0) {
      setSelectedCandidates((current) => ({ ...current, [electionPositionId]: [] }));
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const createdCandidacies = await electionServiceApi.addCandidacies(electionPositionId, newCandidateIds);
      const confirmedIds = createdCandidacies.map((candidacy) => candidacy.candidateId);
      setAssociatedCandidateIds((current) => ({
        ...current,
        [electionPositionId]: [...new Set([...(current[electionPositionId] ?? []), ...confirmedIds])],
      }));
      setSelectedCandidates((current) => ({ ...current, [electionPositionId]: [] }));
      setMessage("Las candidaturas seleccionadas se agregaron al cargo.");
      try {
        await refreshElection();
      } catch (refreshError) {
        setError(`Las candidaturas se agregaron, pero no se pudo actualizar el detalle: ${getApiErrorMessage(refreshError, "error desconocido")}`);
      }
    } catch (operationError) {
      setError(getApiErrorMessage(operationError, "No se pudieron agregar las candidaturas."));
    } finally {
      setBusy(false);
    }
  };

  const publishElection = async () => {
    if (!electionId) return;
    setBusy(true);
    setError("");
    try {
      await electionServiceApi.publishElection(electionId);
      navigate(`/vote/${electionId}`);
    } catch (publishError) {
      setError(getApiErrorMessage(publishError, "No se pudo publicar la elección."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingPage message="Cargando opciones de configuración..." />;
  if (!election) return <Container sx={{ py: 6 }}><Alert severity="error">{error || (!electionId ? "No se proporcionó el identificador de la elección." : "No se encontró la elección.")}</Alert></Container>;

  const positionsConfigured = election.positions.length > 0 &&
    election.positions.every((position) => position.candidacies.length > 0);
  const availablePositions = positions.filter((position) =>
    !election.positions.some((associated) => associated.positionId === position.id) &&
    !associatedPositionIds.includes(position.id)
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Button component={RouterLink} to="/admin" startIcon={<ArrowBack />} sx={{ mb: 3 }}>
          Volver a administración
        </Button>
        <Typography variant="overline" color="secondary.main">CONFIGURACIÓN · {election.status}</Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" }, mt: 1 }}>
          {election.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Asocia cargos electorales y registra las candidaturas antes de publicar la elección.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderColor: "divider", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Cargos electorales</Typography>
          <Stack spacing={2}>
            {positionsError && (
              <Alert severity="warning">
                {positionsError} El contrato documenta la consulta de cargos con rol ROLE_VOTER; puedes crear y asociar un cargo nuevo desde aquí.
              </Alert>
            )}
            {availablePositions.length > 0 && (
              <Box component="form" onSubmit={associatePosition}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <FormControl fullWidth>
                    <InputLabel id="position-select-label">Cargo existente</InputLabel>
                    <Select
                      labelId="position-select-label"
                      value={selectedPositionId}
                      label="Cargo existente"
                      onChange={(event) => setSelectedPositionId(event.target.value)}
                    >
                      {availablePositions.map((position) => (
                        <MenuItem key={position.id} value={position.id}>{position.positionName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button type="submit" variant="outlined" disabled={!selectedPositionId || busy} sx={{ minWidth: 180 }}>
                    Asociar cargo
                  </Button>
                </Stack>
              </Box>
            )}
            {positions.length > 0 && availablePositions.length === 0 && (
              <Alert severity="success">Todos los cargos consultados ya están asociados a esta elección.</Alert>
            )}
            <Box component="form" onSubmit={createAndAssociatePosition}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="Crear cargo nuevo"
                  value={newPositionName}
                  onChange={(event) => setNewPositionName(event.target.value)}
                  required
                  fullWidth
                />
                <Button type="submit" variant="outlined" disabled={busy} sx={{ minWidth: 180 }}>
                  Crear y asociar
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Accordion variant="outlined" sx={{ mb: 3, borderColor: "divider" }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Registrar un candidato nuevo</Typography>
              <Typography variant="body2" color="text.secondary">
                Usa esta opción si la persona todavía no aparece en el catálogo.
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            El contrato del endpoint de creación de candidatos requiere ROLE_VOTER. Si tu cuenta administradora no tiene ese rol, la API rechazará el registro.
          </Alert>
          <Box component="form" onSubmit={createCandidate}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Nombre" value={newCandidate.name} onChange={(event) => setNewCandidate({ ...newCandidate, name: event.target.value })} required slotProps={{ htmlInput: { maxLength: 50 } }} fullWidth />
                <TextField label="Apellido" value={newCandidate.lastName} onChange={(event) => setNewCandidate({ ...newCandidate, lastName: event.target.value })} required slotProps={{ htmlInput: { maxLength: 50 } }} fullWidth />
              </Stack>
              <TextField label="Descripción" value={newCandidate.description} onChange={(event) => setNewCandidate({ ...newCandidate, description: event.target.value })} required slotProps={{ htmlInput: { maxLength: 100 } }} fullWidth />
              <Box><Button type="submit" variant="outlined" startIcon={<PersonAddAlt1Outlined />} disabled={busy}>Registrar candidato</Button></Box>
            </Stack>
          </Box>
          {candidateError && <Alert severity="warning" sx={{ mt: 2 }}>{candidateError}</Alert>}
          </AccordionDetails>
        </Accordion>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Asociar candidatos a los cargos</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Selecciona candidatos del catálogo existente para cada cargo. Los que ya fueron asociados no volverán a aparecer.
        </Typography>
        {election.positions.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>Agrega al menos un cargo para asignar candidaturas.</Alert>}
        <Stack spacing={2}>
          {election.positions.map((position) => (
            <Paper key={position.electionPositionId} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderColor: "divider" }}>
              <Typography variant="h6">{position.positionName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {position.candidacies.length} candidaturas asociadas
              </Typography>
              {candidates.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Registra o consulta candidatos para poder asociarlos.
                </Alert>
              ) : (
                <>
                  {(() => {
                    const availableCandidates = candidates.filter((candidate) =>
                      candidate.isActive &&
                      !position.candidacies.some((item) => item.candidate.id === candidate.id) &&
                      !(associatedCandidateIds[position.electionPositionId] ?? []).includes(candidate.id)
                    );
                    const selectedOptions = availableCandidates.filter((candidate) =>
                      (selectedCandidates[position.electionPositionId] ?? []).includes(candidate.id)
                    );

                    if (availableCandidates.length === 0) {
                      return <Alert severity="success" sx={{ mt: 2 }}>Todos los candidatos activos ya están asociados a este cargo.</Alert>;
                    }

                    return (
                      <Autocomplete
                        multiple
                        options={availableCandidates}
                        value={selectedOptions}
                        getOptionLabel={(candidate) => `${candidate.name} ${candidate.lastName}`}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(_, selected) => setSelectedCandidates((current) => ({
                          ...current,
                          [position.electionPositionId]: selected.map((candidate) => candidate.id),
                        }))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Candidatos registrados"
                            placeholder="Buscar y seleccionar candidatos"
                            sx={{ mt: 2 }}
                          />
                        )}
                      />
                    );
                  })()}
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddAlt1Outlined />}
                    disabled={busy || !(selectedCandidates[position.electionPositionId]?.length)}
                    onClick={() => void addCandidacies(position.electionPositionId)}
                  >
                    Agregar candidaturas
                  </Button>
                </>
              )}
            </Paper>
          ))}
        </Stack>

        <Paper variant="outlined" sx={{ mt: 4, p: { xs: 2.5, md: 3 }, borderColor: "divider" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
            <Box>
              <Typography variant="h6">Publicar elección</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Tras publicarse, una autoridad podrá validar la elección.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<CampaignOutlined />}
              disabled={busy || !positionsConfigured || !["DRAFT", "CREATED"].includes(election.status)}
              onClick={() => void publishElection()}
            >
              Publicar elección
            </Button>
          </Stack>
          {!positionsConfigured && (
            <Alert severity="warning" sx={{ mt: 2 }}>Agrega al menos una candidatura a cada cargo antes de publicar.</Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default ElectionConfigurationPage;
