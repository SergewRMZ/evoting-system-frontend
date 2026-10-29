import { useState } from "react";
import {
  ArrowBack,
  HowToVoteOutlined,
  InfoOutlined,
  LockOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { AlertColor } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ElectionSummary from "../components/voting/ElectionSummary";
import PositionSection from "../components/voting/PositionSection";
import LoadingPage from "../components/LoadingPage";
import FeedbackAlert from "../components/FeedbackAlert";
import useVotingData from "../hooks/useVotingData";
import useAuthorization from "../hooks/authorization-service/useAuthorization";
import type { SignedVote } from "../types/vote.types";
import useBulletinBoard, { VoteAlreadyRegisteredError } from "../hooks/bulletin-board-service/useBulletinBoard";
import { useKeycloak } from "../auth/useKeycloak";

type SubmissionFeedback = {
  message: string;
  severity: AlertColor;
};

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
  const { roles } = useKeycloak();

  const [selectedCandidacies, setSelectedCandidacies] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<SubmissionFeedback | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

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
          message={error?.message ?? "No se pudo cargar la información de la elección. Intenta recargar la página."}
        />
      </Box>
    );
  }

  if (!roles.includes("ROLE_VOTER") || election.status !== "ACTIVE") {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="warning">
          Esta elección no está activa o tu perfil no tiene permiso para emitir un voto.
        </Alert>
        <Button component={RouterLink} to={`/vote/${election.electionId}`} sx={{ mt: 2 }}>
          Volver al detalle
        </Button>
      </Container>
    );
  }

  const selectCandidacy = (electionPositionId: string, candidacyId: string) => {
    if (voteSubmitted) return;
    setSubmissionFeedback(null);
    setSelectedCandidacies((current) => ({
      ...current,
      [electionPositionId]: candidacyId,
    }));
  };

  const prepareVoteSubmission = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSubmissionFeedback({
        severity: "info",
        message: "Preparando y cifrando tu voto de forma segura...",
        });

        try {
            setSubmissionFeedback({
                severity: "info",
                message: "Tu voto está siendo autorizado. Por favor, espera...",
            });

            const authorizedVote: SignedVote = await authorizeVote(
                election,
                selectedCandidacies,
                encryptionPublicKey,
                authorizationPublicKey,
            );

            const registration = await submitVote(authorizedVote, election.electionId);

            setVoteSubmitted(true);
            setSubmissionFeedback({
                severity: "success",
                message: `Tu voto se emitió correctamente y quedó registrado. Identificador: ${registration.voteId}`,
            });
        } catch (error) {
            if (error instanceof VoteAlreadyRegisteredError) {
              setVoteSubmitted(true);
              setSubmissionFeedback({
                severity: "success",
                message: error.voteId
                  ? `Tu voto ya había sido emitido y registrado. Identificador: ${error.voteId}`
                  : "Tu voto ya había sido emitido y registrado para esta elección. No se volvió a enviar.",
              });
              return;
            }
            setSubmissionFeedback({
                severity: "error",
                message:
                error instanceof Error
                    ? error.message
                    : "Ha ocurrido un error al autorizar tu voto. Inténtalo nuevamente.",
            });
        } finally {
            setIsSubmitting(false);
        }
  };

  const selectedCount = Object.keys(selectedCandidacies).length;
  const submitForReview = () => {
    if (selectedCount !== election.positions.length) {
      setSubmissionFeedback({
        severity: "error",
        message: "Selecciona una candidatura para cada cargo antes de continuar.",
      });
      return;
    }
    setReviewOpen(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />

      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Button
          component={RouterLink}
          to="/vote"
          startIcon={<ArrowBack />}
          sx={{ mb: 3, color: "text.secondary" }}
        >
          Volver a elecciones
        </Button>

        <ElectionSummary election={election} />

        <Alert
          icon={<InfoOutlined />}
          severity="info"
          sx={{
            mb: 3,
            border: "1px solid rgba(155,138,251,.22)",
            bgcolor: "rgba(155,138,251,.07)",
            fontSize: "1.2rem",
            color: "text.primary",
            "& .MuiAlert-icon": { color: "primary.main" },
          }}
        >
          Tu identidad se usa para validar tu participación en el proceso.
          Selecciona el candidato de tu preferencia para cada posición electoral
          y prepara tu voto.
        </Alert>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            mb: 2,
            justifyContent: "space-between",
            alignItems: { sm: "center" },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Puestos de elección
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCount} de {election.positions.length} con selección
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {election.positions.map((position) => (
            <PositionSection
              key={position.electionPositionId}
              position={position}
              selectedCandidateId={
                selectedCandidacies[position.electionPositionId]
              }
              selectionDisabled={voteSubmitted}
              onCandidacySelect={selectCandidacy}
            />
          ))}
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: { xs: 2.5, md: 3 },
            borderColor: "divider",
            bgcolor: "rgba(255,255,255,.02)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { sm: "center" },
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <LockOutlined sx={{ color: "secondary.main" }} />
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  ¿Listo para preparar tu voto?
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Revisa tus selecciones antes de confirmar la emisión del voto.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              size="large"
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <HowToVoteOutlined />
                )
              }
              onClick={submitForReview}
              disabled={isSubmitting || voteSubmitted || election.positions.length === 0}
              sx={{ px: 3, whiteSpace: "nowrap" }}
            >
              {isSubmitting ? "Procesando voto..." : voteSubmitted ? "Voto emitido" : "Revisar y continuar"}
            </Button>
          </Stack>
          {submissionFeedback && (
            <Box sx={{ mt: 2 }}>
              <FeedbackAlert
                severity={submissionFeedback.severity}
                message={submissionFeedback.message}
              />
              {voteSubmitted && (
                <Button component={RouterLink} to={`/vote/${election.electionId}/bulletin`} sx={{ mt: 1 }}>
                  Consultar tablón público
                </Button>
              )}
            </Box>
          )}
        </Paper>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2, textAlign: "center" }}
        >
          La solicitud de autorización se envía al servicio de autorización de
          votos.
        </Typography>
      </Container>
      <Dialog open={reviewOpen} onClose={() => !isSubmitting && setReviewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Confirma tus selecciones</DialogTitle>
        <DialogContent dividers>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Verifica tu selección para cada cargo. Al confirmar, el voto se cifrará y se enviará para su autorización y registro.
          </Typography>
          <Stack spacing={1.5}>
            {election.positions.map((position) => {
              const candidacy = position.candidacies.find(
                (item) => item.candidacyId === selectedCandidacies[position.electionPositionId],
              );
              return (
                <Paper key={position.electionPositionId} variant="outlined" sx={{ p: 1.5, borderColor: "divider" }}>
                  <Typography variant="caption" color="text.secondary">{position.positionName}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {candidacy ? `${candidacy.candidate.name} ${candidacy.candidate.lastName}` : "Sin selección"}
                  </Typography>
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReviewOpen(false)} disabled={isSubmitting}>Volver a editar</Button>
          <Button
            variant="contained"
            onClick={() => {
              setReviewOpen(false);
              void prepareVoteSubmission();
            }}
            disabled={isSubmitting}
          >
            Confirmar y emitir voto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VotePage;
