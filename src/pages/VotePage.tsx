import { useEffect, useState } from "react";
import {
  ArrowBack,
  CheckCircle,
  HowToVoteOutlined,
  InfoOutlined,
  LockOutlined,
  Refresh,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const ELECTION_ID = "f1bc0b8e-d161-4ead-87c0-7f66d41debd6";
const ELECTION_URL = `/api/election-service/elections/${ELECTION_ID}`;

type ElectionStatus = "CREATED" | "VERIFIED" | "ACTIVE" | "CLOSED" | "FINISHED";

type Candidate = {
  candidateId: string;
  name: string;
  lastName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ElectionPosition = {
  electionPositionId: string;
  positionId: string;
  positionName: string;
  candidates: Candidate[];
};

type Election = {
  electionId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ElectionStatus;
  positions: ElectionPosition[];
};

type ElectionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; election: Election };

const electionStatusLabels: Record<ElectionStatus, string> = {
  CREATED: "Creada",
  VERIFIED: "Verificada",
  ACTIVE: "Activa",
  CLOSED: "Cerrada",
  FINISHED: "Finalizada",
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "UTC",
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(
      value,
    ) &&
    Number.isFinite(Date.parse(value))
  );
}

function isCandidate(value: unknown): value is Candidate {
  return (
    isRecord(value) &&
    isUuid(value.candidateId) &&
    typeof value.name === "string" &&
    typeof value.lastName === "string" &&
    typeof value.description === "string" &&
    typeof value.isActive === "boolean" &&
    isIsoDate(value.createdAt) &&
    isIsoDate(value.updatedAt)
  );
}

function isElectionPosition(value: unknown): value is ElectionPosition {
  return (
    isRecord(value) &&
    isUuid(value.electionPositionId) &&
    isUuid(value.positionId) &&
    typeof value.positionName === "string" &&
    Array.isArray(value.candidates) &&
    value.candidates.every(isCandidate)
  );
}

function isElection(value: unknown): value is Election {
  return (
    isRecord(value) &&
    isUuid(value.electionId) &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    isIsoDate(value.startDate) &&
    isIsoDate(value.endDate) &&
    typeof value.status === "string" &&
    ["CREATED", "VERIFIED", "ACTIVE", "CLOSED", "FINISHED"].includes(
      value.status,
    ) &&
    Array.isArray(value.positions) &&
    value.positions.every(isElectionPosition)
  );
}

function formatElectionDate(value: string) {
  return `${dateFormatter.format(new Date(value))} UTC`;
}

function candidateInitials(candidate: Candidate) {
  return `${candidate.name.trim().charAt(0)}${candidate.lastName.trim().charAt(0)}`.toUpperCase();
}

function VotePage() {
  const [electionState, setElectionState] = useState<ElectionState>({
    status: "loading",
  });
  const [selectedCandidates, setSelectedCandidates] = useState<
    Record<string, string>
  >({});
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadElection() {
      setElectionState({ status: "loading" });

      let response: Response;
      try {
        response = await fetch(ELECTION_URL, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
      } catch {
        if (!controller.signal.aborted) {
          setElectionState({
            status: "error",
            message:
              "No fue posible conectar con el servicio de elecciones. Verifica que esté disponible e inténtalo de nuevo.",
          });
        }
        return;
      }

      if (!response.ok) {
        setElectionState({
          status: "error",
          message: `El servicio de elecciones respondió con HTTP ${response.status}. Inténtalo de nuevo.`,
        });
        return;
      }

      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch {
        setElectionState({
          status: "error",
          message: "El servicio devolvió una respuesta que no es JSON válido.",
        });
        return;
      }

      if (!isElection(responseBody)) {
        setElectionState({
          status: "error",
          message:
            "La respuesta del servicio no tiene el formato esperado para una elección.",
        });
        return;
      }

      setElectionState({ status: "success", election: responseBody });
    }

    void loadElection();
    return () => controller.abort();
  }, [retryCount]);

  const election =
    electionState.status === "success" ? electionState.election : null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ bgcolor: "#101828", color: "white" }}>
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

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBack />}
          sx={{ mb: 4, color: "text.secondary" }}
        >
          Salir de la elección
        </Button>

        {electionState.status === "loading" && (
          <Paper sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
            <Typography variant="h5">Cargando elección</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Estamos consultando los puestos y las candidaturas disponibles.
            </Typography>
          </Paper>
        )}

        {electionState.status === "error" && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<Refresh />}
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Reintentar
              </Button>
            }
          >
            {electionState.message}
          </Alert>
        )}

        {election && (
          <>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 4, justifyContent: "space-between" }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 700,
                    letterSpacing: ".12em",
                  }}
                >
                  ELECCIÓN
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mt: 1, alignItems: { sm: "center" } }}
                >
                  <Typography
                    variant="h2"
                    sx={{ fontSize: { xs: "2.3rem", md: "3.4rem" } }}
                  >
                    {election.name}
                  </Typography>
                  <Chip
                    label={electionStatusLabels[election.status]}
                    color={election.status === "ACTIVE" ? "success" : "default"}
                  />
                </Stack>
                <Typography
                  color="text.secondary"
                  sx={{ mt: 1.5, fontSize: "1.05rem" }}
                >
                  {election.description}
                </Typography>
              </Box>
              <Paper
                variant="outlined"
                sx={{ p: 2, minWidth: { md: 280 }, alignSelf: { md: "end" } }}
              >
                <Typography variant="body2" color="text.secondary">
                  Periodo de la elección (UTC)
                </Typography>
                <Typography sx={{ mt: 0.75, fontWeight: 600 }}>
                  {formatElectionDate(election.startDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ my: 0.25 }}>
                  hasta
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {formatElectionDate(election.endDate)}
                </Typography>
              </Paper>
            </Stack>

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

            {election.positions.length === 0 ? (
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
                {election.positions.map((position) => {
                  const selectedCandidateId =
                    selectedCandidates[position.electionPositionId];

                  return (
                    <Paper
                      key={position.electionPositionId}
                      sx={{
                        p: { xs: 2, md: 4 },
                        border: "1px solid #eaecf0",
                        boxShadow: "0 4px 16px rgba(16,24,40,.04)",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        sx={{
                          mb: 3,
                          justifyContent: "space-between",
                          alignItems: { sm: "center" },
                        }}
                      >
                        <Box>
                          <Typography variant="h5">
                            {position.positionName}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Selecciona una candidatura para este puesto
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color={
                            selectedCandidateId
                              ? "primary.main"
                              : "text.secondary"
                          }
                          sx={{ fontWeight: 700, mt: { xs: 1.5, sm: 0 } }}
                        >
                          {selectedCandidateId
                            ? "1 seleccionada"
                            : "Ninguna seleccionada"}
                        </Typography>
                      </Stack>

                      {position.candidates.length === 0 ? (
                        <Alert severity="info">
                          Este puesto todavía no tiene candidatos registrados.
                        </Alert>
                      ) : (
                        <Grid container spacing={2}>
                          {position.candidates.map((candidate, index) => {
                            const isSelected =
                              selectedCandidateId === candidate.candidateId;
                            const isAvailable = candidate.isActive;
                            const colors = [
                              "#155eef",
                              "#7f56d9",
                              "#039855",
                              "#dc6803",
                            ];

                            return (
                              <Grid
                                key={candidate.candidateId}
                                size={{ xs: 12, md: 4 }}
                              >
                                <Card
                                  sx={{
                                    height: "100%",
                                    border: "2px solid",
                                    borderColor: isSelected
                                      ? "primary.main"
                                      : "#eaecf0",
                                    bgcolor: isSelected ? "#f5f8ff" : "white",
                                    borderRadius: 3,
                                    boxShadow: isSelected
                                      ? "0 0 0 4px rgba(21,94,239,.1)"
                                      : "none",
                                    transition: "all .2s ease",
                                  }}
                                >
                                  <CardActionArea
                                    disabled={!isAvailable}
                                    aria-pressed={isSelected}
                                    onClick={() =>
                                      setSelectedCandidates((current) => ({
                                        ...current,
                                        [position.electionPositionId]:
                                          candidate.candidateId,
                                      }))
                                    }
                                    sx={{
                                      height: "100%",
                                      p: 2.5,
                                      "&.Mui-disabled": { opacity: 1 },
                                    }}
                                  >
                                    <Stack
                                      direction="row"
                                      sx={{
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 56,
                                          height: 56,
                                          bgcolor: colors[index % colors.length],
                                          fontWeight: 700,
                                        }}
                                      >
                                        {candidateInitials(candidate)}
                                      </Avatar>
                                      {isSelected && (
                                        <CheckCircle color="primary" />
                                      )}
                                    </Stack>
                                    <Typography variant="h6" sx={{ mt: 3 }}>
                                      {`${candidate.name} ${candidate.lastName}`.trim()}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={isAvailable ? "Activo" : "Inactivo"}
                                      color={isAvailable ? "success" : "default"}
                                      sx={{ mt: 1 }}
                                    />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        lineHeight: 1.6,
                                        mt: 2,
                                        minHeight: 45,
                                      }}
                                    >
                                      {candidate.description ||
                                        "Sin descripción disponible."}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        mt: 2,
                                        color: isAvailable
                                          ? "primary.main"
                                          : "text.secondary",
                                        fontWeight: 700,
                                        textAlign: "center",
                                      }}
                                    >
                                      {!isAvailable
                                        ? "No disponible para selección"
                                        : isSelected
                                          ? "Candidato seleccionado"
                                          : "Seleccionar"}
                                    </Typography>
                                  </CardActionArea>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      )}
                    </Paper>
                  );
                })}
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
