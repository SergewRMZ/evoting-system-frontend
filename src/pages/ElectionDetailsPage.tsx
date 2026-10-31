import { useState } from "react";
import {
  ArrowBack,
  BarChartOutlined,
  HowToVoteOutlined,
  ManageSearchOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingPage from "../components/LoadingPage";
import useElectionDetails from "../hooks/election-service/useElectionDetails";
import { useKeycloak } from "../auth/useKeycloak";
import electionServiceApi from "../services/election-service/election.api";
import authorizationServiceApi from "../services/authorization-service/authorization.api";
import tallyServiceApi from "../services/tally-service/tally-service.api";
import type { ElectionTallyResult } from "../services/tally-service/tally-service.types";
import { getApiErrorMessage } from "../errors/apiErrorMap";
import type { ElectionStatus } from "../services/election-service/election.types";

const labels: Record<ElectionStatus, string> = {
  DRAFT: "Borrador",
  CREATED: "Creada",
  PUBLISHED: "Publicada",
  VERIFIED: "Verificada",
  ACTIVE: "Activa",
  CLOSED: "Cerrada",
  FINISHED: "Finalizada",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));

function ElectionDetailsPage() {
  const { electionId } = useParams<{ electionId: string }>();
  const { election, loading, error, reload } = useElectionDetails(electionId);
  const { roles } = useKeycloak();
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isAuthority = roles.includes("ROLE_AUTHORITY");
  const isVoter = roles.includes("ROLE_VOTER");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [tallyResults, setTallyResults] = useState<ElectionTallyResult[] | null>(null);

  if (loading) return <LoadingPage message="Cargando detalle de la elección..." />;
  if (error || !election) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">
          {error
            ? getApiErrorMessage(error, "election")
            : "No se encontró la elección."}
        </Alert>
      </Container>
    );
  }

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    setBusyAction(label);
    setActionError("");
    setActionMessage("");
    try {
      const result = await action();
      if (result && typeof result === "object" && "status" in result) {
        await reload();
      }
      setActionMessage("La operación se completó correctamente.");
    } catch (actionError) {
      setActionError(getApiErrorMessage(actionError, "election"));
    } finally {
      setBusyAction("");
    }
  };

  const countVotes = async () => {
    setBusyAction("tally");
    setActionError("");
    setActionMessage("");
    try {
      setTallyResults(await tallyServiceApi.tallyElection(election.electionId));
      setActionMessage("El conteo finalizó correctamente.");
    } catch (tallyError) {
      setActionError(getApiErrorMessage(tallyError, "tally"));
    } finally {
      setBusyAction("");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Button component={RouterLink} to="/vote" startIcon={<ArrowBack />} sx={{ mb: 3 }}>
          Volver a elecciones
        </Button>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 5 }, borderColor: "divider" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
            <Box>
              <Typography variant="overline" color="secondary.main">
                INFORMACIÓN DE LA ELECCIÓN
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" }, mt: 1 }}>
                {election.name}
              </Typography>
            </Box>
            <Chip label={labels[election.status]} color={election.status === "ACTIVE" ? "success" : "default"} />
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
            {election.description}
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, flex: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">Inicio</Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 600 }}>{formatDate(election.startDate)}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">Finalización</Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 600 }}>{formatDate(election.endDate)}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">Cargos electorales</Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 600 }}>{election.positions.length}</Typography>
            </Paper>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
            <Button
              component={RouterLink}
              to={`/vote/${election.electionId}/bulletin`}
              variant="outlined"
              startIcon={<ManageSearchOutlined />}
            >
              Consultar tablón público
            </Button>

            {/* Botón de resultados: visible para todos si la elección está FINISHED */}
            {election.status === "FINISHED" && (
              <Button
                component={RouterLink}
                to={`/vote/${election.electionId}/results`}
                variant="outlined"
                startIcon={<BarChartOutlined />}
                color="secondary"
              >
                Ver resultados finales
              </Button>
            )}

            {isVoter && election.status === "ACTIVE" && (
              <Button
                component={RouterLink}
                to={`/vote/${election.electionId}/ballot`}
                variant="contained"
                startIcon={<HowToVoteOutlined />}
              >
                Emitir voto
              </Button>
            )}
            {isAdmin && (
              <Button
                component={RouterLink}
                to={`/admin/elections/${election.electionId}`}
                variant="outlined"
                startIcon={<SettingsOutlined />}
              >
                Configurar elección
              </Button>
            )}
          </Stack>

          {(isAuthority || isAdmin) && (
            <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Acciones de gestión</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                {isAuthority && election.status === "PUBLISHED" && (
                  <Button variant="contained" disabled={Boolean(busyAction)} onClick={() => runAction("validate", () => electionServiceApi.validateElection(election.electionId))}>
                    Validar elección
                  </Button>
                )}
                {isAuthority && election.status === "VERIFIED" && (
                  <Button variant="contained" disabled={Boolean(busyAction)} onClick={() => runAction("activate", () => electionServiceApi.activateElection(election.electionId))}>
                    Activar elección
                  </Button>
                )}
                {isAuthority && election.status === "VERIFIED" && (
                  <>
                    <Button variant="outlined" disabled={Boolean(busyAction)} onClick={() => runAction("authorization-keys", () => authorizationServiceApi.createKeys(election.electionId))}>
                      Crear claves de autorización
                    </Button>
                    <Button variant="outlined" disabled={Boolean(busyAction)} onClick={() => runAction("encryption-keys", () => tallyServiceApi.createKeys(election.electionId))}>
                      Crear claves de cifrado
                    </Button>
                  </>
                )}
                {isAuthority && election.status === "ACTIVE" && (
                  <>
                    <Button variant="outlined" disabled={Boolean(busyAction)} onClick={() => runAction("activate-authorization-keys", () => authorizationServiceApi.activateKeys(election.electionId))}>
                      Activar claves de autorización
                    </Button>
                    <Button variant="outlined" disabled={Boolean(busyAction)} onClick={() => runAction("activate-encryption-keys", () => tallyServiceApi.activateKeys(election.electionId))}>
                      Activar claves de cifrado
                    </Button>
                  </>
                )}
                {isAuthority && election.status === "CLOSED" && (
                  <Button variant="contained" disabled={Boolean(busyAction)} onClick={() => void countVotes()}>
                    Contabilizar votos
                  </Button>
                )}
              </Stack>
              {actionError && <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>}
              {actionMessage && <Alert severity="success" sx={{ mt: 2 }}>{actionMessage}</Alert>}
            </Box>
          )}
        </Paper>

        {tallyResults && (
          <Paper variant="outlined" sx={{ mt: 3, borderColor: "divider", overflow: "hidden" }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Resultados del conteo</Typography>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Candidatura</TableCell>
                  <TableCell align="right">Votos contabilizados</TableCell>
                  <TableCell align="right">Resultado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tallyResults.map((result, index) => {
                  const position = election.positions.find(
                    (item) => item.electionPositionId === result.electionPositionId,
                  );
                  const candidacy = position?.candidacies.find(
                    (item) => item.candidacyId === result.candidacyId,
                  );
                  return (
                    <TableRow key={`${result.electionPositionId}-${result.candidacyId}-${index}`}>
                      <TableCell>{position?.positionName ?? result.electionPositionId}</TableCell>
                      <TableCell>
                        {candidacy
                          ? `${candidacy.candidate.name} ${candidacy.candidate.lastName}`
                          : result.candidacyId}
                      </TableCell>
                      <TableCell align="right">{result.totalVotes}</TableCell>
                      <TableCell align="right">{result.result}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}

        <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>Cargos y candidaturas</Typography>
        {election.positions.length === 0 ? (
          <Alert severity="info">Todavía no se han asociado cargos electorales a esta elección.</Alert>
        ) : (
          <Stack spacing={2}>
            {election.positions.map((position) => (
              <Paper key={position.electionPositionId} variant="outlined" sx={{ p: 2.5, borderColor: "divider" }}>
                <Typography variant="h6">{position.positionName}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {position.candidacies.length} candidaturas
                </Typography>
                <Stack direction="row" sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
                  {position.candidacies.map(({ candidacyId, candidate }) => (
                    <Chip key={candidacyId} label={`${candidate.name} ${candidate.lastName}`} variant="outlined" />
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export default ElectionDetailsPage;
