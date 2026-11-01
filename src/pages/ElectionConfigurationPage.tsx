import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowBack,
  CampaignOutlined,
  EditOutlined,
  PersonAddAlt1Outlined,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingPage from "../components/LoadingPage";
import electionServiceApi from "../services/election-service/election.api";
import type {
  Candidate,
  CreateCandidateRequest,
  CreateElectionRequest,
  ElectionDetails,
  Position,
} from "../services/election-service/election.types";
import { getApiErrorMessage, getHttpStatus } from "../errors/apiErrorMap";
import ElectionFormDialog from "../components/election/ElectionFormDialog";
import ElectionStatusChip from "../components/election/ElectionStatusChip";
import { electionToFormValues } from "../utils/electionForm";
import { isElectionReadyToPublish } from "../utils/electionStatus";

function ElectionConfigurationPage() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<ElectionDetails | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [positionsError, setPositionsError] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [associationDialogPositionId, setAssociationDialogPositionId] = useState("");
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
        setError(getApiErrorMessage(electionResult.reason, "tally", "No se pudo cargar la elección."));
      }

      if (positionsResult.status === "fulfilled") {
        setPositions(positionsResult.value);
        setPositionsError("");
      } else {
        setPositionsError(getApiErrorMessage(positionsResult.reason, "election", "No se pudieron consultar los cargos existentes."));
      }

      if (candidatesResult.status === "fulfilled") {
        setCandidates(candidatesResult.value);
        setCandidateError("");
      } else {
        setCandidateError(getApiErrorMessage(candidatesResult.reason, "election", "No se pudieron consultar los candidatos existentes."));
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
    if (election?.status !== "DRAFT") {
      setError("Solo se puede configurar una elección en estado borrador.");
      return;
    }
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
        setError(`El cargo se asoció, pero no se pudo actualizar el detalle: ${getApiErrorMessage(refreshError, "generic", "error desconocido")}`);
      }
    } catch (operationError) {
      setError(getApiErrorMessage(operationError, "election", "No se pudo asociar el cargo."));
    } finally {
      setBusy(false);
    }
  };

  const createAndAssociatePosition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (election?.status !== "DRAFT") {
      setError("Solo se puede configurar una elección en estado borrador.");
      return;
    }
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
      setError(getApiErrorMessage(operationError, "election", "No se pudo crear o asociar el cargo."));
    } finally {
      setBusy(false);
    }
  };

  const createCandidate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (election?.status !== "DRAFT") {
      setError("Solo se puede configurar una elección en estado borrador.");
      return;
    }
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
      setError(getApiErrorMessage(operationError, "election", "No se pudo registrar el candidato."));
    } finally {
      setBusy(false);
    }
  };

  const addCandidacies = async (electionPositionId: string) => {
    if (election?.status !== "DRAFT") {
      setError("Solo se puede configurar una elección en estado borrador.");
      return;
    }
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
      setAssociationDialogPositionId("");
      try {
        await refreshElection();
      } catch (refreshError) {
        setError(`Las candidaturas se agregaron, pero no se pudo actualizar el detalle: ${getApiErrorMessage(refreshError, "generic", "error desconocido")}`);
      }
    } catch (operationError) {
      setError(getApiErrorMessage(operationError, "election", "No se pudieron agregar las candidaturas."));
    } finally {
      setBusy(false);
    }
  };

  const reloadCandidates = async () => {
    setCandidateLoading(true);
    setCandidateError("");
    try {
      setCandidates(await electionServiceApi.getCandidates());
    } catch (loadError) {
      setCandidateError(getApiErrorMessage(loadError, "election", "No se pudieron consultar los candidatos existentes."));
    } finally {
      setCandidateLoading(false);
    }
  };

  const updateElection = async (request: CreateElectionRequest) => {
    if (!electionId) return;
    try {
      await electionServiceApi.updateElection(electionId, request);
    } catch (updateError) {
      const status = getHttpStatus(updateError);
      const message = status === 409
        ? "La elección ya no está en borrador, por lo que no puede modificarse. Recarga la página para ver su estado actual."
        : status === 400
          ? "Los datos no son válidos. Revisa los campos e inténtalo de nuevo."
          : getApiErrorMessage(updateError, "election", "No se pudieron guardar los cambios.");
      throw new Error(message, { cause: updateError });
    }
    setEditDialogOpen(false);
    setMessage("Los datos de la elección se actualizaron correctamente.");
    try {
      await refreshElection();
    } catch (refreshError) {
      setError(`Los cambios se guardaron, pero no se pudo actualizar el detalle: ${getApiErrorMessage(refreshError, "generic", "error desconocido")}`);
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
      setError(getApiErrorMessage(publishError, "election", "No se pudo publicar la elección."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingPage message="Cargando opciones de configuración..." />;
  if (!election) return <Container sx={{ py: 6 }}><Alert severity="error">{error || (!electionId ? "No se proporcionó el identificador de la elección." : "No se encontró la elección.")}</Alert></Container>;

  const positionsConfigured = isElectionReadyToPublish(election);
  const canConfigure = election.status === "DRAFT";
  const availablePositions = positions.filter((position) =>
    !election.positions.some((associated) => associated.positionId === position.id) &&
    !associatedPositionIds.includes(position.id)
  );
  const associationDialogPosition = election.positions.find(
    (position) => position.electionPositionId === associationDialogPositionId,
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Button component={RouterLink} to="/admin" startIcon={<ArrowBack />} sx={{ mb: 3 }}>
          Volver a administración
        </Button>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography variant="overline" color="secondary.main">CONFIGURACIÓN</Typography>
          <ElectionStatusChip status={election.status} size="small" />
        </Stack>
        <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" }, mt: 1 }}>
          {election.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Asocia cargos electorales y registra las candidaturas antes de publicar la elección.
        </Typography>

        {!canConfigure && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta elección está en estado {election.status}. La configuración solo está disponible mientras permanece en borrador.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <Paper variant="outlined" sx={{ borderColor: "divider", mb: 3, p: { xs: 2.5, md: 3 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Datos generales</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{election.description}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {new Date(election.startDate).toLocaleString("es-MX")} — {new Date(election.endDate).toLocaleString("es-MX")}
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<EditOutlined />} disabled={!canConfigure || busy} onClick={() => setEditDialogOpen(true)}>
              Editar datos
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ borderColor: "divider", mb: 3, overflow: "hidden" }}>
          <Tabs
            value={activeTab}
            onChange={(_, value: number) => setActiveTab(value)}
            aria-label="Secciones de configuración de la elección"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 1, sm: 2 } }}
          >
            <Tab label={`Cargos electorales (${election.positions.length})`} id="configuration-tab-positions" aria-controls="configuration-panel-positions" />
            <Tab label={`Candidatos (${candidates.length})`} id="configuration-tab-candidates" aria-controls="configuration-panel-candidates" />
          </Tabs>

          {activeTab === 0 && (
            <Box role="tabpanel" id="configuration-panel-positions" aria-labelledby="configuration-tab-positions" sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Define los cargos de esta elección</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Asocia cargos existentes o crea nuevos. Después podrás asignarles candidatos desde la pestaña correspondiente.
              </Typography>
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
                          disabled={!canConfigure || busy}
                          onChange={(event) => setSelectedPositionId(event.target.value)}
                        >
                          {availablePositions.map((position) => (
                            <MenuItem key={position.id} value={position.id}>{position.positionName}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button type="submit" variant="outlined" disabled={!canConfigure || !selectedPositionId || busy} sx={{ minWidth: 180 }}>
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
                      disabled={!canConfigure || busy}
                      required
                      fullWidth
                    />
                    <Button type="submit" variant="outlined" disabled={!canConfigure || busy} sx={{ minWidth: 180 }}>
                      Crear y asociar
                    </Button>
                  </Stack>
                </Box>
                {election.positions.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Cargos incluidos</Typography>
                    <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
                      {election.positions.map((position) => (
                        <Paper key={position.electionPositionId} variant="outlined" sx={{ px: 1.5, py: 1, borderColor: "divider" }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{position.positionName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {position.candidacies.length} candidaturas
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {activeTab === 1 && (
            <Box role="tabpanel" id="configuration-panel-candidates" aria-labelledby="configuration-tab-candidates" sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Candidatos y candidaturas</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Registra personas en el catálogo y asígnalas a los cargos de esta elección.
              </Typography>

              <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderColor: "divider" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Registrar un candidato nuevo</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  El contrato del endpoint de creación de candidatos requiere ROLE_VOTER. Si tu cuenta administradora no tiene ese rol, la API rechazará el registro.
                </Alert>
                <Box component="form" onSubmit={createCandidate}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <TextField label="Nombre" value={newCandidate.name} onChange={(event) => setNewCandidate({ ...newCandidate, name: event.target.value })} disabled={!canConfigure || busy} required slotProps={{ htmlInput: { maxLength: 50 } }} fullWidth />
                      <TextField label="Apellido" value={newCandidate.lastName} onChange={(event) => setNewCandidate({ ...newCandidate, lastName: event.target.value })} disabled={!canConfigure || busy} required slotProps={{ htmlInput: { maxLength: 50 } }} fullWidth />
                    </Stack>
                    <TextField label="Descripción" value={newCandidate.description} onChange={(event) => setNewCandidate({ ...newCandidate, description: event.target.value })} disabled={!canConfigure || busy} required slotProps={{ htmlInput: { maxLength: 100 } }} fullWidth />
                    <Box><Button type="submit" variant="outlined" startIcon={<PersonAddAlt1Outlined />} disabled={!canConfigure || busy}>Registrar candidato</Button></Box>
                  </Stack>
                </Box>
              </Paper>

              {candidateError && (
                <Alert
                  severity="warning"
                  sx={{ mb: 2 }}
                  action={
                    <Button color="inherit" size="small" onClick={() => void reloadCandidates()} disabled={candidateLoading}>
                      {candidateLoading ? "Consultando..." : "Reintentar"}
                    </Button>
                  }
                >
                  No se pudo cargar el catálogo de candidatos: {candidateError}
                </Alert>
              )}
              {election.positions.length === 0 ? (
                <Alert severity="info">Agrega al menos un cargo desde la pestaña «Cargos electorales» para asignar candidaturas.</Alert>
              ) : (
                <Stack spacing={1.5}>
                  {election.positions.map((position) => (
                    <Paper key={position.electionPositionId} variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderColor: "divider" }}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
                        <Box>
                          <Typography variant="h6">{position.positionName}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {position.candidacies.length} candidaturas asociadas
                          </Typography>
                          {position.candidacies.length > 0 && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {position.candidacies.map((candidacy) => `${candidacy.candidate.name} ${candidacy.candidate.lastName}`).join(" · ")}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          startIcon={<PersonAddAlt1Outlined />}
                          disabled={!canConfigure || busy || candidateLoading || candidates.length === 0}
                          onClick={() => setAssociationDialogPositionId(position.electionPositionId)}
                        >
                          Asignar candidatos
                        </Button>
                      </Stack>
                      {candidates.length === 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          {candidateLoading
                            ? "Consultando candidatos..."
                            : candidateError
                              ? "La consulta del catálogo falló; usa la opción de reintento para volver a cargarlo."
                              : "No hay candidatos registrados para asociar a este cargo."}
                        </Alert>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Paper>

        <ElectionFormDialog
          open={editDialogOpen}
          mode="edit"
          initialValues={electionToFormValues(election)}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={updateElection}
        />

        <Dialog
          open={Boolean(associationDialogPosition)}
          onClose={() => !busy && setAssociationDialogPositionId("")}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Asignar candidatos · {associationDialogPosition?.positionName}</DialogTitle>
          <DialogContent>
            {associationDialogPosition && (() => {
              const { electionPositionId } = associationDialogPosition;
              const availableCandidates = candidates.filter((candidate) =>
                candidate.isActive &&
                !associationDialogPosition.candidacies.some((item) => item.candidate.id === candidate.id) &&
                !(associatedCandidateIds[electionPositionId] ?? []).includes(candidate.id)
              );
              const selectedOptions = availableCandidates.filter((candidate) =>
                (selectedCandidates[electionPositionId] ?? []).includes(candidate.id)
              );

              if (availableCandidates.length === 0) {
                return <Alert severity="success" sx={{ mt: 1 }}>Todos los candidatos activos ya están asociados a este cargo.</Alert>;
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
                    [electionPositionId]: selected.map((candidate) => candidate.id),
                  }))}
                  disabled={!canConfigure || busy}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Candidatos registrados"
                      placeholder="Buscar y seleccionar candidatos"
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              );
            })()}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setAssociationDialogPositionId("")} disabled={busy}>Cancelar</Button>
            <Button
              variant="contained"
              startIcon={<PersonAddAlt1Outlined />}
              disabled={!canConfigure || busy || !(selectedCandidates[associationDialogPositionId]?.length)}
              onClick={() => void addCandidacies(associationDialogPositionId)}
            >
              {busy ? "Guardando..." : "Agregar candidaturas"}
            </Button>
          </DialogActions>
        </Dialog>

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
