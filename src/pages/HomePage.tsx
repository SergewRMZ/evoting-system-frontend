import {
  ArrowForward,
  CheckCircleOutlined,
  LockOutlined,
  HowToVoteOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const benefits = [
  {
    icon: <LockOutlined />,
    title: "Anonimato real",
    description:
      "Tu identidad se valida por separado de tu voto. Nadie puede saber qué opción elegiste.",
  },
  {
    icon: <VerifiedUserOutlined />,
    title: "Proceso verificable",
    description:
      "Cada elección cuenta con controles que protegen la integridad de los resultados.",
  },
  {
    icon: <HowToVoteOutlined />,
    title: "Sin complicaciones",
    description:
      "Participa desde cualquier dispositivo con una experiencia clara y accesible.",
  },
];

function HomePage() {
  return (
    <Box sx={{ minHeight: "100vh", overflow: "hidden" }}>
      <Box
        component="header"
        sx={{
          bgcolor: "#101828",
          color: "white",
          position: "relative",
          "&:after": {
            content: '""',
            position: "absolute",
            width: 460,
            height: 460,
            borderRadius: "50%",
            bgcolor: "rgba(21, 94, 239, .2)",
            right: -160,
            top: -250,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" sx={{ py: 3, justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box sx={{ bgcolor: "secondary.main", borderRadius: 2, p: 1, display: "flex" }}>
                <HowToVoteOutlined />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>VotoClaro</Typography>
            </Stack>
            <Button component={RouterLink} to="/login" variant="outlined" color="inherit" sx={{ borderColor: "rgba(255,255,255,.35)" }}>
              Ingresar
            </Button>
          </Stack>

          <Grid container spacing={6} sx={{ py: { xs: 7, md: 11 }, alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="overline" sx={{ color: "#6ce9a6", letterSpacing: ".16em", fontWeight: 700 }}>
                ELECCIONES ESTUDIANTILES 2026
              </Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: "3.2rem", md: "5.2rem" }, lineHeight: 1.02, mt: 2, maxWidth: 700 }}>
                Tu voz cuenta. Tu voto, solo tuyo.
              </Typography>
              <Typography sx={{ color: "#d0d5dd", fontSize: "1.15rem", lineHeight: 1.7, maxWidth: 570, mt: 3 }}>
                Participa en una elección digital diseñada para que tu identidad y tu decisión permanezcan siempre separadas.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 5 }}>
                <Button component={RouterLink} to="/login" variant="contained" size="large" endIcon={<ArrowForward />} sx={{ px: 3, py: 1.5 }}>
                  Comenzar a votar
                </Button>
                <Button href="#privacidad" variant="text" size="large" sx={{ color: "white", px: 3 }}>
                  Conoce la privacidad
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ bgcolor: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 5, p: 3, backdropFilter: "blur(12px)" }}>
                <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: "center" }}>
                  <Box sx={{ bgcolor: "#d1fadf", color: "#067647", borderRadius: "50%", p: 1, display: "flex" }}>
                    <LockOutlined />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>Privacidad por diseño</Typography>
                    <Typography variant="body2" sx={{ color: "#98a2b3" }}>Tu voto se registra de forma anónima</Typography>
                  </Box>
                </Stack>
                {["Identidad verificada", "Voto cifrado", "Registro protegido"].map((item) => (
                  <Stack key={item} direction="row" spacing={1.5} sx={{ py: 1.5, borderTop: "1px solid rgba(255,255,255,.12)", alignItems: "center" }}>
                    <CheckCircleOutlined sx={{ color: "#6ce9a6", fontSize: 20 }} />
                    <Typography sx={{ color: "#eaecf0" }}>{item}</Typography>
                  </Stack>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" id="privacidad" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: ".14em" }}>
          CONFIANZA EN CADA ELECCIÓN
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" }, maxWidth: 680, mt: 1.5 }}>
          La tecnología facilita votar. La privacidad hace que sea confiable.
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 650, mt: 2, fontSize: "1.05rem", lineHeight: 1.7 }}>
          En VotoClaro nunca vinculamos tu identidad con tu selección. Puedes participar con la tranquilidad de que tu decisión es libre y confidencial.
        </Typography>
        <Grid container spacing={3} sx={{ mt: 6 }}>
          {benefits.map((benefit) => (
            <Grid key={benefit.title} size={{ xs: 12, md: 4 }}>
              <Box sx={{ height: "100%", p: 3.5, border: "1px solid #eaecf0", borderRadius: 3, bgcolor: "white" }}>
                <Box sx={{ display: "inline-flex", p: 1.25, borderRadius: 2, bgcolor: "#eff4ff", color: "primary.main" }}>{benefit.icon}</Box>
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>{benefit.title}</Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>{benefit.description}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ mt: 10 }} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 4, justifyContent: "space-between", alignItems: { sm: "center" } }}>
          <Typography color="text.secondary">Una elección clara empieza por una decisión informada.</Typography>
          <Button component={RouterLink} to="/login" variant="contained" endIcon={<ArrowForward />}>Ir a la elección</Button>
        </Stack>
      </Container>
    </Box>
  );
}

export default HomePage;
