import { useEffect, useState } from "react";
import {
  ArrowBack,
  DownloadOutlined,
  HowToVoteOutlined,
  InfoOutlined,
  ManageSearchOutlined,
  ReplayOutlined,
  TaskAltOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import { Link as RouterLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ElectionSummary from "../components/voting/ElectionSummary";
import BallotStepper from "../components/voting/BallotStepper";
import SignaturePanel from "../components/voting/SignaturePanel";
import LoadingPage from "../components/LoadingPage";
import FeedbackAlert from "../components/FeedbackAlert";
import useVotingData from "../hooks/useVotingData";
import useAuthorization from "../hooks/authorization-service/useAuthorization";
import authorizationServiceApi from "../services/authorization-service/authorization.api";
import type { AuthorizedVote } from "../types/vote.types";
import useBulletinBoard, {
  VoteAlreadyRegisteredError,
} from "../hooks/bulletin-board-service/useBulletinBoard";
import { mapApiError } from "../errors/apiErrorMap";
import { downloadVoteReceipt } from "../utils/voting/voteReceipt";

/**
 * - checking: consultando si el votante ya solicitó autorización en esta elección.
 * - alreadyVoted: ya la solicitó; no puede volver a votar.
 * - ballot: eligiendo candidaturas, un cargo a la vez.
 * - review: confirmando las selecciones antes de autorizar.
 * - processing: cifrando, autorizando y depositando el voto.
 * - submitFailed: el voto se autorizó pero no llegó a la urna; se puede reintentar.
 * - completed: el voto quedó registrado.
 */
type Phase =
  | "checking"
  | "statusError"
  | "alreadyVoted"
  | "ballot"
  | "review"
  | "processing"
  | "submitFailed"
  | "completed";

type Registration = {
  voteId?: string;
  registeredAt: Date;
};

function isAlreadyAuthorized(error: unknown): boolean {
  const cause = error instanceof Error ? error.cause : undefined;
  return axios.isAxiosError(cause) && cause.response?.status === 409;
}

/**
 * Vista del proceso de votación.
 * Acceso controlado exclusivamente por la ruta protegida (ROLE_VOTER).
 */
function VotePage() {
  const { electionId } = useParams<{ electionId: string }>();
  const {
    election,
    encryptionPublicKey,
    authorizationPublicKey,
    loading,
    error,
  } = useVotingData(electionId);

  const { authorizeVote } = useAuthorization();
  const { submitVote } = useBulletinBoard();

  const [phase, setPhase] = useState<Phase>("checking");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [returnToLastPosition, setReturnToLastPosition] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authorizedVote, setAuthorizedVote] = useState<AuthorizedVote | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);

  // Un votante que ya obtuvo su firma ciega no puede obtener otra, así que no se le
  // muestra la boleta.
  useEffect(() => {
    if (!electionId) return;
    let cancelled = false;
    authorizationServiceApi
      .getMyAuthorizationStatus(electionId)
      .then((status) => {
        if (!cancelled) setPhase(status.authorized ? "alreadyVoted" : "ballot");
      })
      .catch(() => {
        if (!cancelled) setPhase("statusError");
      });
    return () => {
      cancelled = true;
    };
  }, [electionId]);

  // Un voto autorizado que no llegó a la urna se pierde si se cierra la página,
  // porque no se puede volver a autorizar.
  useEffect(() => {
    if (phase !== "submitFailed" && phase !== "processing") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  if (loading) return <LoadingPage />;

  if (error || !election || !encryptionPublicKey || !authorizationPublicKey) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <FeedbackAlert
          severity="error"
          message={
            error
              ? mapApiError(error, "election").message
              : "No se pudo cargar la información de la elección. Intenta recargar la página."
          }
        />
      </Box>
    );
  }

  // La elección debe estar activa para poder votar
  if (election.status !== "ACTIVE") {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="warning">
          Esta elección no se encuentra activa en este momento. No es posible
          emitir un voto.
        </Alert>
        <Button
          component={RouterLink}
          to={`/vote/${election.electionId}`}
          sx={{ mt: 2 }}
        >
          Volver al detalle
        </Button>
      </Container>
    );
  }

  if (phase === "checking") return <LoadingPage />;

  const selectCandidacy = (electionPositionId: string, candidacyId: string) => {
    setSelections((current) => ({ ...current, [electionPositionId]: candidacyId }));
  };

  const depositVote = async (vote: AuthorizedVote) => {
    setPhase("processing");
    setErrorMessage(null);
    setProgressMessage("Depositando tu voto en la urna digital...");
    try {
      const result = await submitVote(vote.signedVote, election.electionId);
      setRegistration({ voteId: result.voteId, registeredAt: new Date() });
      setPhase("completed");
    } catch (err) {
      if (err instanceof VoteAlreadyRegisteredError) {
        setRegistration({ voteId: err.voteId, registeredAt: new Date() });
        setPhase("completed");
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : "No se pudo registrar el voto.");
      setPhase("submitFailed");
    }
  };

  const emitVote = async () => {
    setPhase("processing");
    setErrorMessage(null);
    setProgressMessage("Cifrando tu voto y solicitando su autorización...");
    let vote: AuthorizedVote;
    try {
      vote = await authorizeVote(
        election,
        selections,
        encryptionPublicKey,
        authorizationPublicKey,
      );
    } catch (err) {
      if (isAlreadyAuthorized(err)) {
        setPhase("alreadyVoted");
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : "No se pudo autorizar el voto.");
      setPhase("review");
      return;
    }
    setAuthorizedVote(vote);
    await depositVote(vote);
  };

  const backButton = (
    <Button
      component={RouterLink}
      to="/vote"
      startIcon={<ArrowBack />}
      sx={{ mb: 3, color: "text.secondary" }}
    >
      Volver a elecciones
    </Button>
  );

  const bulletinButton = (
    <Button
      component={RouterLink}
      to={`/vote/${election.electionId}/bulletin`}
      variant="outlined"
      startIcon={<ManageSearchOutlined />}
    >
      Consultar tablón público
    </Button>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />

      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        {backButton}

        <ElectionSummary election={election} />

        {phase === "statusError" && (
          <Alert severity="error">
            No se pudo verificar si ya emitiste tu voto en esta elección. Recarga la
            página para intentarlo de nuevo.
          </Alert>
        )}

        {phase === "alreadyVoted" && (
          <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2}>
              <Alert severity="info" icon={<TaskAltOutlined />}>
                Ya emitiste tu voto en esta elección. Cada votante puede autorizar
                un solo voto, por lo que no es posible volver a votar.
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Si guardaste tu comprobante, puedes buscar el identificador de tu
                voto en el tablón público.
              </Typography>
              <Box>{bulletinButton}</Box>
            </Stack>
          </Paper>
        )}

        {phase === "ballot" && (
          <>
            <Alert icon={<InfoOutlined />} severity="info" sx={{ mb: 3 }}>
              Elige una candidatura para cada cargo. Los cargos se muestran uno a
              la vez; al final podrás revisar tu voto antes de emitirlo.
            </Alert>
            <BallotStepper
              positions={election.positions}
              selections={selections}
              onSelect={selectCandidacy}
              onComplete={() => setPhase("review")}
              initialIndex={returnToLastPosition ? election.positions.length - 1 : 0}
            />
          </>
        )}

        {phase === "review" && (
          <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Revisa tu voto
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Al confirmar, tu voto se cifra en este navegador, se envía cegado al
              servicio de autorización y después se deposita en la urna digital.
              Una vez autorizado no podrás cambiarlo.
            </Typography>
            <Stack spacing={1.5}>
              {election.positions.map((position) => {
                const candidacy = position.candidacies.find(
                  (item) => item.candidacyId === selections[position.electionPositionId],
                );
                return (
                  <Paper key={position.electionPositionId} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {position.positionName}
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {candidacy
                        ? `${candidacy.candidate.name} ${candidacy.candidate.lastName}`
                        : "Sin selección"}
                    </Typography>
                  </Paper>
                );
              })}
            </Stack>
            {errorMessage && (
              <Box sx={{ mt: 2 }}>
                <FeedbackAlert severity="error" message={errorMessage} />
              </Box>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3, justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setErrorMessage(null);
                  setReturnToLastPosition(true);
                  setPhase("ballot");
                }}
              >
                Volver a editar
              </Button>
              <Button
                variant="contained"
                startIcon={<HowToVoteOutlined />}
                onClick={() => void emitVote()}
              >
                Confirmar y emitir voto
              </Button>
            </Stack>
          </Paper>
        )}

        {(phase === "processing" || phase === "submitFailed" || phase === "completed") && (
          <Stack spacing={3}>
            {phase === "processing" && (
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{progressMessage}</Typography>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  No cierres esta página hasta que tu voto quede registrado.
                </Typography>
              </Paper>
            )}

            {phase === "submitFailed" && (
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Alert severity="warning">
                    Tu voto ya fue autorizado, pero no se pudo depositar en la urna
                    digital{errorMessage ? `: ${errorMessage}` : "."} Reintenta el
                    envío sin cerrar esta página: el mismo voto se enviará de nuevo,
                    sin volver a autorizarlo.
                  </Alert>
                  <Box>
                    <Button
                      variant="contained"
                      startIcon={<ReplayOutlined />}
                      onClick={() => authorizedVote && void depositVote(authorizedVote)}
                    >
                      Reintentar envío
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            )}

            {phase === "completed" && registration && (
              <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                  <Alert severity="success" icon={<TaskAltOutlined />}>
                    Tu voto quedó registrado en la urna digital.
                  </Alert>
                  {registration.voteId ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Identificador de tu voto
                      </Typography>
                      <Typography
                        sx={{ fontFamily: "monospace", fontSize: { xs: 15, sm: 18 }, fontWeight: 700, wordBreak: "break-all" }}
                      >
                        {registration.voteId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Descarga tu comprobante para verificar después en el tablón
                        público que tu voto fue registrado. No contiene tu identidad
                        ni tus selecciones, y el sistema no lo envía ni lo guarda.
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Tu voto ya había sido registrado anteriormente.
                    </Typography>
                  )}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    {registration.voteId && authorizedVote && (
                      <Button
                        variant="contained"
                        startIcon={<DownloadOutlined />}
                        onClick={() =>
                          void downloadVoteReceipt({
                            electionId: election.electionId,
                            electionName: election.name,
                            voteId: registration.voteId!,
                            registeredAt: registration.registeredAt,
                            digest: authorizedVote.signedVote.digest,
                            signature: authorizedVote.signedVote.signature,
                            bulletinUrl: `${window.location.origin}/vote/${election.electionId}/bulletin`,
                          })
                        }
                      >
                        Descargar comprobante
                      </Button>
                    )}
                    {bulletinButton}
                  </Stack>
                </Stack>
              </Paper>
            )}

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Autorización de tu voto
              </Typography>
              <SignaturePanel
                blindSignature={authorizedVote?.blindSignature}
                signature={authorizedVote?.signedVote.signature}
              />
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export default VotePage;
