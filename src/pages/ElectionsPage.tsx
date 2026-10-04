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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Navbar from "../components/Navbar";
import type { ElectionStatus } from "../features/elections/electionTypes";
import useElections from "../hooks/elections/useElections";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const statusLabels: Record<ElectionStatus, string> = {
  CREATED: "Programada",
  PUBLISHED: "Publicada",
  VERIFIED: "Verificada",
  ACTIVE: "Activa",
  CLOSED: "Cerrada",
  FINISHED: "Finalizada",
};

function ElectionsPage() {
  const { elections } = useElections();

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
            sx={{ fontWeight: 700, letterSpacing: ".13em" }}
          >
            TU PARTICIPACIÓN ES CONFIDENCIAL
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
          Realiza tu participación de manera anónima.
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 620, mt: 2, fontSize: "1.05rem", lineHeight: 1.7 }}
        >
          A continuación revisa las elecciones disponibles y selecciona los candidatos de tu preferencia.
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mt: 5, mb: 2.5 }}
        >
          <RadioButtonChecked sx={{ color: "secondary.main", fontSize: 18 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Elecciones activas
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

        {elections.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 5 }, borderColor: "divider" }}
          >
            <Typography variant="h6">No hay elecciones activas</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Cuando haya una elección disponible, aparecerá en esta sección.
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
                    background:
                      "linear-gradient(135deg, rgba(155,138,251,.08), rgba(18,18,22,1) 55%)",
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
                    <Chip
                      size="small"
                      icon={<RadioButtonChecked sx={{ fontSize: "12px !important" }} />}
                      label={statusLabels[election.status]}
                      sx={{
                        color: "secondary.main",
                        bgcolor: "rgba(114,230,177,.1)",
                      }}
                    />
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
                      Ver elección
                    </Typography>
                    <ArrowForward fontSize="small" />
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Paper
          variant="outlined"
          sx={{
            mt: 5,
            p: { xs: 2.5, md: 3 },
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            borderColor: "divider",
            bgcolor: "rgba(255,255,255,.02)",
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
        </Paper>
      </Container>
    </Box>
  );
}

export default ElectionsPage;
