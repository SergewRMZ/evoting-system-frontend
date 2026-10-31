import { ArrowBack, BarChartOutlined, RefreshOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingPage from "../components/LoadingPage";
import PositionResultChart from "../components/results/PositionResultChart";
import useElectionDetails from "../hooks/election-service/useElectionDetails";
import useElectionResults from "../hooks/tally-service/useElectionResults";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));

/**
 * Vista pública de resultados finales de una elección.
 *
 * Regla de negocio: los resultados solo son visibles cuando la elección
 * está en estado FINISHED. Accesible para ROLE_VOTER, ROLE_AUTHORITY y ROLE_ADMIN.
 *
 * Endpoint consumido:
 *   GET /api/tally-service/elections/{electionId}/results
 */
function ElectionResultsPage() {
  const { electionId } = useParams<{ electionId: string }>();
  const { election, loading: loadingElection, error: electionError } =
    useElectionDetails(electionId);
  const {
    results,
    loading: loadingResults,
    error: resultsError,
    refetch,
  } = useElectionResults(
    // Solo hacemos la petición si la elección ya está FINISHED
    election?.status === "FINISHED" ? electionId : undefined
  );

  // ── Estado de carga ──────────────────────────────────────────────────────
  if (loadingElection) return <LoadingPage message="Cargando elección..." />;

  if (electionError || !election) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">
          {electionError?.message ?? "No se encontró la elección solicitada."}
        </Alert>
      </Container>
    );
  }

  // ── Regla de negocio: solo elecciones FINISHED ───────────────────────────
  if (election.status !== "FINISHED") {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar />
        <Container sx={{ py: 8, textAlign: "center" }}>
          <BarChartOutlined
            sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Resultados no disponibles
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            Los resultados finales de esta elección solo son visibles una vez
            que el proceso ha concluido. Estado actual:{" "}
            <strong>{election.status}</strong>.
          </Typography>
          <Button
            component={RouterLink}
            to={`/vote/${election.electionId}`}
            startIcon={<ArrowBack />}
          >
            Volver al detalle
          </Button>
        </Container>
      </Box>
    );
  }

  // ── Vista principal ──────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Button
          component={RouterLink}
          to={`/vote/${election.electionId}`}
          startIcon={<ArrowBack />}
          sx={{ mb: 3, color: "text.secondary" }}
        >
          Volver al detalle
        </Button>

        {/* ── Encabezado ── */}
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2.5, md: 4 }, mb: 3, borderColor: "divider" }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 2 }}
          >
            <Box>
              <Typography variant="overline" color="secondary.main">
                RESULTADOS FINALES
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mt: 0.5, letterSpacing: "-.03em" }}
              >
                {election.name}
              </Typography>
            </Box>
            <Chip label="Finalizada" color="success" />
          </Stack>

          <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {election.description}
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, flex: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">
                Inicio
              </Typography>
              <Typography sx={{ fontWeight: 600, mt: 0.5 }}>
                {formatDate(election.startDate)}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">
                Finalización
              </Typography>
              <Typography sx={{ fontWeight: 600, mt: 0.5 }}>
                {formatDate(election.endDate)}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">
                Cargos electorales
              </Typography>
              <Typography sx={{ fontWeight: 600, mt: 0.5 }}>
                {election.positions.length}
              </Typography>
            </Paper>
          </Stack>
        </Paper>

        {/* ── Resultados por cargo ── */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 2, alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Resultados por cargo
          </Typography>
          <Button
            startIcon={
              loadingResults ? (
                <CircularProgress size={16} />
              ) : (
                <RefreshOutlined />
              )
            }
            onClick={refetch}
            disabled={loadingResults}
            variant="outlined"
            size="small"
          >
            Actualizar
          </Button>
        </Stack>

        {resultsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {resultsError}
          </Alert>
        )}

        {loadingResults ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {election.positions.map((position, idx) => (
              <Paper
                key={position.electionPositionId}
                variant="outlined"
                sx={{ p: { xs: 2, md: 3 }, borderColor: "divider" }}
              >
                <PositionResultChart position={position} results={results} />
                {idx < election.positions.length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Paper>
            ))}
          </Stack>
        )}

        {!loadingResults && results.length === 0 && !resultsError && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No se encontraron resultados registrados para esta elección.
          </Alert>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 4, textAlign: "center" }}
        >
          Los resultados son públicos y han sido calculados mediante el
          servicio de escrutinio de votos.
        </Typography>
      </Container>
    </Box>
  );
}

export default ElectionResultsPage;

