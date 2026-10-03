import {
  ArrowForward,
  HowToVoteOutlined,
  KeyOutlined,
  LockOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const privacyPillars = [
  {
    icon: <VerifiedUserOutlined />,
    title: "Identidad verificada",
    description:
      "La autenticación confirma tu derecho a participar, sin necesidad de mostrar tu selección.",
  },
  {
    icon: <KeyOutlined />,
    title: "Voto protegido",
    description:
      "La criptografía puede proteger el contenido del voto mientras se transmite y se procesa.",
  },
  {
    icon: <LockOutlined />,
    title: "Separación de datos",
    description:
      "Un diseño cuidadoso evita que la identidad del participante quede asociada a su decisión.",
  },
];

function HomePage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="header"
        sx={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          background:
            "radial-gradient(ellipse at 78% 22%, rgba(126,104,239,.16), transparent 38%), #09090b",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack
            direction="row"
            sx={{
              py: 3,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  bgcolor: "rgba(114,230,177,.12)",
                  color: "secondary.main",
                  borderRadius: 2,
                  p: 1,
                  display: "flex",
                }}
              >
                <HowToVoteOutlined />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                VotoClaro
              </Typography>
            </Stack>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="inherit"
              sx={{ borderColor: "rgba(255,255,255,.2)" }}
            >
              Ingresar
            </Button>
          </Stack>

          <Grid
            container
            spacing={{ xs: 5, md: 8 }}
            sx={{ py: { xs: 8, md: 13 }, alignItems: "center" }}
          >
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "secondary.main",
                  letterSpacing: ".16em",
                  fontWeight: 700,
                }}
              >
                PARTICIPACIÓN SEGURA Y CONFIDENCIAL
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "3.15rem", md: "5rem" },
                  lineHeight: 1.02,
                  mt: 2,
                  maxWidth: 720,
                }}
              >
                Tu voz cuenta. Tu voto es privado.
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "1.05rem", md: "1.15rem" },
                  lineHeight: 1.8,
                  maxWidth: 610,
                  mt: 3,
                }}
              >
                El voto anónimo protege la libertad de cada persona. Con una
                arquitectura adecuada, la criptografía permite verificar la
                participación y proteger la elección sin revelar su contenido
                ni vincularla con quien votó.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{ px: 3, py: 1.5 }}
                >
                  Ir a votar
                </Button>
                <Button
                  href="#privacidad"
                  variant="text"
                  size="large"
                  sx={{ color: "text.primary", px: 2 }}
                >
                  Cómo se protege tu voto
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderColor: "rgba(255,255,255,.12)",
                  bgcolor: "rgba(18,18,22,.78)",
                  boxShadow: "0 24px 90px rgba(0,0,0,.28)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <Stack direction="row" spacing={2} sx={{ mb: 2.5, alignItems: "center" }}>
                  <Box
                    sx={{
                      bgcolor: "rgba(114,230,177,.12)",
                      color: "secondary.main",
                      borderRadius: "50%",
                      p: 1.25,
                      display: "flex",
                    }}
                  >
                    <LockOutlined />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      Privacidad desde el diseño
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      La confianza empieza antes de votar
                    </Typography>
                  </Box>
                </Stack>
                {[
                  ["01", "Se valida quién puede participar"],
                  ["02", "Se protege la elección con criptografía"],
                  ["03", "Se conserva la separación entre datos"],
                ].map(([step, label]) => (
                  <Stack
                    key={step}
                    direction="row"
                    spacing={2}
                    sx={{
                      py: 2,
                      borderTop: "1px solid rgba(255,255,255,.08)",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "secondary.main", fontWeight: 700 }}
                    >
                      {step}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {label}
                    </Typography>
                  </Stack>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" id="privacidad" sx={{ py: { xs: 8, md: 11 } }}>
        <Typography
          variant="overline"
          sx={{ color: "secondary.main", fontWeight: 700, letterSpacing: ".14em" }}
        >
          POR QUÉ IMPORTA EL ANONIMATO
        </Typography>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: "2.2rem", md: "3.25rem" }, maxWidth: 750, mt: 1.5 }}
        >
          Una decisión libre necesita privacidad.
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 710, mt: 2, fontSize: "1.05rem", lineHeight: 1.8 }}
        >
          Cuando las personas pueden elegir sin temor a que su identidad se
          relacione con su voto, participan con mayor confianza. En una votación
          web, proteger esa libertad requiere algo más que ocultar un nombre:
          también exige cuidar cómo se recopilan, transmiten y procesan los datos.
        </Typography>
        <Grid container spacing={2} sx={{ mt: 5 }}>
          {privacyPillars.map((pillar) => (
            <Grid key={pillar.title} size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  height: "100%",
                  p: 3,
                  borderColor: "divider",
                  bgcolor: "rgba(255,255,255,.02)",
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: "rgba(155,138,251,.12)",
                    color: "primary.main",
                  }}
                >
                  {pillar.icon}
                </Box>
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  {pillar.title}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  {pillar.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            pt: 4,
            mt: 6,
            borderTop: "1px solid",
            borderColor: "divider",
            justifyContent: "space-between",
            alignItems: { sm: "center" },
          }}
        >
          <Typography color="text.secondary">
            Una elección clara comienza con una decisión informada.
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            endIcon={<ArrowForward />}
          >
            Participar
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export default HomePage;
