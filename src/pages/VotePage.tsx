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
import useBulletinBoard from "../hooks/bulletin-board-service/useBulletinBoard";

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

  const [selectedCandidacies, setSelectedCandidacies] = useState<
    Record<string, string>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] =
    useState<SubmissionFeedback | null>(null);

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
          message="No se pudo cargar la información de la elección. Intenta recargar la página."
        />
      </Box>
    );
  }

  const selectCandidacy = (electionPositionId: string, candidacyId: string) => {
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

            console.log("Voto autorizado: ", JSON.stringify(authorizedVote, null, 2));
            await submitVote(authorizedVote, electionId!);
            
            setSubmissionFeedback({
                severity: "success",
                message: "Tu voto ha sido emitido correctamente",
            });
        } catch (error) {
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
                  Puedes cambiar tus selecciones antes de continuar.
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
              onClick={prepareVoteSubmission}
              disabled={isSubmitting}
              sx={{ px: 3, whiteSpace: "nowrap" }}
            >
              {isSubmitting ? "Procesando voto..." : "Preparar voto"}
            </Button>
          </Stack>
          {submissionFeedback && (
            <Box sx={{ mt: 2 }}>
              <FeedbackAlert
                severity={submissionFeedback.severity}
                message={submissionFeedback.message}
              />
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
    </Box>
  );
}

export default VotePage;
