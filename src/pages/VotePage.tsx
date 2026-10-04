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
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import type { ElectionDetails } from "../features/elections/electionTypes";
import ElectionSummary from "../features/voting/ElectionSummary";
import PositionSection from "../features/voting/PositionSection";
import useElectionDetails from "../hooks/elections/useElectionDetails";
import LoadingPage from "../components/LoadingPage";

type VoteChoice = 0 | 1;

type VotePayload = {
  electionId: string;
  positions: {
    electionPositionId: string;
    positionId: string;
    ballot: {
      candidateId: string;
      vote: VoteChoice;
    }[];
  }[];
};

function createVotePayload(
  election: ElectionDetails,
  selectedCandidates: Record<string, string>,
): VotePayload {
  return {
    electionId: election.electionId,
    positions: election.positions.map((position) => ({
      electionPositionId: position.electionPositionId,
      positionId: position.positionId,
      ballot: position.candidates.map((candidate) => ({
        candidateId: candidate.candidateId,
        vote:
          selectedCandidates[position.electionPositionId] ===
          candidate.candidateId
            ? 1
            : 0,
      })),
    })),
  };
}

function VotePage() {
  const { electionId } = useParams<{ electionId: string }>();
  const { election, loading, error } = useElectionDetails(electionId);
  console.log(election);
  const [selectedCandidates, setSelectedCandidates] = 
      useState<Record<string, string>>({});

  const [submissionMessage, setSubmissionMessage] = 
      useState<string | null>(null);

  if (loading) return <LoadingPage/>
  if (error || !election) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Alert severity="error">
          No se pudo cargar la información de la elección.
        </Alert>
      </Box>
      
    )
  }
  const selectedElection = election;

  function selectCandidate(electionPositionId: string, candidateId: string) {
    setSubmissionMessage(null);
    setSelectedCandidates((current) => ({
      ...current,
      [electionPositionId]: candidateId,
    }));
  }

  function prepareVoteSubmission() {
    const payload = createVotePayload(selectedElection, selectedCandidates);
    console.info("Payload del voto preparado (sin enviar a una API):", payload);
    setSubmissionMessage(
      "Voto preparado. El token y el payload se imprimieron en la consola; todavía no se envió ninguna solicitud.",
    );
  }

  const selectedCount = Object.keys(selectedCandidates).length;

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

        <ElectionSummary election={election!} />

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
          
          Tu identidad se usa para validar tu participación en el proceso. Selecciona el candidato de tu preferencia para cada posición electoral y prepara tu voto.
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
                selectedCandidates[position.electionPositionId]
              }
              onCandidateSelect={selectCandidate}
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
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <LockOutlined sx={{ color: "secondary.main" }} />
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  ¿Listo para preparar tu voto?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Puedes cambiar tus selecciones antes de continuar.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              size="large"
              startIcon={<HowToVoteOutlined />}
              onClick={prepareVoteSubmission}
              sx={{ px: 3, whiteSpace: "nowrap" }}
            >
              Preparar voto
            </Button>
          </Stack>
          {submissionMessage && (
            <Alert
              severity={submissionMessage.startsWith("No se encontró") ? "error" : "success"}
              sx={{ mt: 2 }}
            >
              {submissionMessage}
            </Alert>
          )}
        </Paper>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2, textAlign: "center" }}
        >
          Esta demostración solo prepara e imprime los datos. No se conecta a
          ningún servicio de votación.
        </Typography>
      </Container>
    </Box>
  );
}

export default VotePage;
