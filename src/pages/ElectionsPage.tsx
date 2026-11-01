import {
  ArrowForward,
  HowToVoteOutlined,
  LockOutlined,
  RadioButtonChecked,
  ShieldOutlined,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ElectionStatusChip from "../components/election/ElectionStatusChip";
import Navbar from "../components/Navbar";
import useElections from "../hooks/election-service/useElections";
import { useKeycloak } from "../auth/useKeycloak";
import LoadingPage from "../components/LoadingPage";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function ElectionsPage() {
  const { elections: allElections, loading, error } = useElections();
  const { roles } = useKeycloak();
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isAuthority = roles.includes("ROLE_AUTHORITY");
  const audience = isAdmin ? "admin" : isAuthority ? "authority" : "voter";
  const elections = allElections.filter(({ status }) => {
    if (isAdmin) return true;
    if (isAuthority) return status !== "DRAFT";
    return status === "ACTIVE" || status === "CLOSED" || status === "FINISHED";
  });

  if (loading) return <LoadingPage message="Cargando elecciones disponibles..." />;

  const copy = {
    admin: {
      eyebrow: "CENTRO DE ADMINISTRACIÓN",
      title: "Supervisión de procesos electorales.",
      description: "En este panel podrás visualizar las elecciones en sus diferentes estados. Así como la información con mayor detalle de cada una.",
      section: "Todas las elecciones",
      emptyTitle: "Aún no hay elecciones",
      emptyDescription: "Crea y configura una elección desde el panel de administración.",
      action: "Gestionar elección",
    },
    authority: {
      eyebrow: "PANEL DE AUTORIDAD ELECTORAL",
      title: "Revisa y acompaña cada proceso.",
      description: "Consulta elecciones publicadas y continúa con las acciones de validación y activación disponibles.",
      section: "Elecciones para revisión",
      emptyTitle: "No hay elecciones para revisar",
      emptyDescription: "Las elecciones aparecerán aquí cuando estén publicadas. Los borradores no se muestran a la autoridad.",
      action: "Revisar elección",
    },
    voter: {
      eyebrow: "TU PARTICIPACIÓN ES CONFIDENCIAL",
      title: "Consulta los procesos electorales.",
      description: "Revisa el detalle de las elecciones disponibles y consulta su tablón público. Si una elección está activa, podrás emitir tu voto.",
      section: "Elecciones disponibles",
      emptyTitle: "No hay elecciones disponibles",
      emptyDescription: "Las elecciones activas, cerradas o finalizadas aparecerán aquí.",
      action: "Ver elección",
    },
  }[audience];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", color: "secondary.main", mb: 2 }}
        >
          <LockOutlined fontSize="small" />
          <Typography
            variant="overline"
            sx={{ fontWeight: 700, letterSpacing: ".15em" }}
          >
            {copy.eyebrow}
          </Typography>
        </Stack>
        <Typography
          variant="h1"
          sx={{
            maxWidth: 760,
            fontSize: { xs: "2.7rem", md: "4.25rem" },
            lineHeight: 1.05,
          }}
        >
          {copy.title}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 620, mt: 2, fontSize: "1.05rem", lineHeight: 1.7 }}
        >
          {copy.description}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mt: 5, mb: 2.5 }}
        >
          <RadioButtonChecked sx={{ color: "secondary.main", fontSize: 18 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {copy.section}
          </Typography>
          <Chip
            size="small"
            label={elections.length}
            sx={{
              ml: 0.5,
              bgcolor: "rgba(114,230,177,.12)",
              color: "secondary.main",
              fontWeight: 700,
            }}
          />
        </Stack>

        {error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : elections.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 5 }, borderColor: "divider" }}
          >
            <Typography variant="h6">{copy.emptyTitle}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {copy.emptyDescription}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {elections.map((election) => (
              <Grid key={election.electionId} size={{ xs: 12, md: 6 }}>
                <Paper
                  component={RouterLink}
                  to={`/vote/${election.electionId}`}
                  variant="outlined"
                  sx={{
                    display: "block",
                    height: "100%",
                    p: { xs: 2.5, sm: 3.5 },
                    color: "inherit",
                    textDecoration: "none",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    transition: "border-color .2s ease, transform .2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-3px)",
                    },
                    "&:focus-visible": {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        p: 1.2,
                        display: "flex",
                        borderRadius: 2,
                        color: "primary.main",
                        bgcolor: "rgba(155,138,251,.12)",
                      }}
                    >
                      <HowToVoteOutlined />
                    </Box>
                    <ElectionStatusChip status={election.status} size="small" />
                  </Stack>
                  <Typography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
                    {election.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1.5 }}
                  >
                    Periodo de votación ·{" "}
                    {dateFormatter.format(new Date(election.startDate))} –{" "}
                    {dateFormatter.format(new Date(election.endDate))} UTC
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      mt: 3.5,
                      color: "primary.main",
                    }}
                  >
                    <ShieldOutlined fontSize="small" />
                    <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 700 }}>
                      {copy.action}
                    </Typography>
                    <ArrowForward fontSize="small" />
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {audience === "voter" && <Paper
          variant="outlined"
          sx={{
            mt: 5,
            p: { xs: 2.5, md: 3 },
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <ShieldOutlined sx={{ color: "secondary.main", mt: { xs: 0.25, sm: 0 } }} />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>
              Tu voto es solo tuyo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              La autenticación confirma que puedes participar; Se utiliza la criptografía
              para mantener tu voto anónimo y seguro. Tu elección permanece cifrada.
            </Typography>
          </Box>
        </Paper>}
      </Container>
    </Box>
  );
}

export default ElectionsPage;
