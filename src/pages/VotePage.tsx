import { useState } from "react";
import {
  ArrowBack,
  HowToVoteOutlined,
  InfoOutlined,
  LockOutlined,
  Refresh,
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
import { Link as RouterLink } from "react-router-dom";
import { useElection } from "../features/elections/useElection";
import ElectionSummary from "../features/voting/ElectionSummary";
import PositionSection from "../features/voting/PositionSection";

const ELECTION_ID = "f1bc0b8e-d161-4ead-87c0-7f66d41debd6";

function VotePage() {
  const { state, retry } = useElection(ELECTION_ID);
  const [selectedCandidates, setSelectedCandidates] = useState<
    Record<string, string>
  >({});

  function selectCandidate(electionPositionId: string, candidateId: string) {
    setSelectedCandidates((current) => ({
      ...current,
      [electionPositionId]: candidateId,
    }));
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box component="header" sx={{ bgcolor: "#101828", color: "white" }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            sx={{
              py: 2.5,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <HowToVoteOutlined sx={{ color: "#6ce9a6" }} />
              <Typography sx={{ fontWeight: 700 }}>VotoClaro</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <LockOutlined sx={{ fontSize: 17, color: "#6ce9a6" }} />
              <Typography variant="body2" sx={{ color: "#d0d5dd" }}>
                Voto anónimo y protegido
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBack />}
          sx={{ mb: 4, color: "text.secondary" }}
        >
          Salir de la elección
        </Button>

        {state.status === "loading" && (
          <Paper sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
            <Typography variant="h5">Cargando elección</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Estamos consultando los puestos y las candidaturas disponibles.
            </Typography>
          </Paper>
        )}

        {state.status === "error" && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<Refresh />}
                onClick={retry}
              >
                Reintentar
              </Button>
            }
          >
            {state.message}
          </Alert>
        )}

        {state.status === "success" && (
          <>
            <ElectionSummary election={state.election} />

            <Alert
              icon={<InfoOutlined />}
              severity="info"
              sx={{
                mb: 4,
                border: "1px solid #b2ddff",
                bgcolor: "#eff8ff",
                color: "#175cd3",
                "& .MuiAlert-icon": { color: "#175cd3" },
              }}
            >
              Tu identidad ya fue verificada. Puedes revisar las candidaturas y
              cambiar tus selecciones antes de continuar.
            </Alert>

            {state.election.positions.length === 0 ? (
              <Paper
                sx={{
                  p: { xs: 3, md: 5 },
                  border: "1px solid #eaecf0",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6">No hay puestos disponibles</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Esta elección todavía no tiene puestos configurados.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {state.election.positions.map((position) => (
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
            )}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3, textAlign: "right" }}
            >
              La selección se muestra en esta pantalla; el servicio de registro
              del voto aún no está conectado.
            </Typography>
          </>
        )}
      </Container>
    </Box>
  );
}

export default VotePage;
