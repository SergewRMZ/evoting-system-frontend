import type { ReactNode } from "react";
import {
  ArrowForward,
  BadgeOutlined,
  FactCheckOutlined,
  HowToVoteOutlined,
  KeyOutlined,
  LockOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import { Box, Button, Container, Divider, Grid, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";
import { useKeycloak } from "../auth/useKeycloak";
import { getHomePath } from "../auth/roles";

const steps = [
  {
    icon: <BadgeOutlined />,
    title: "Regístrate con tu matrícula",
    description: "Crea tu cuenta con tu correo institucional y tu matrícula de 10 dígitos.",
  },
  {
    icon: <FactCheckOutlined />,
    title: "Validamos tu registro",
    description: "Un administrador comprueba tu matrícula y habilita tu participación.",
  },
  {
    icon: <HowToVoteOutlined />,
    title: "Vota de forma anónima",
    description: "Cuando una elección esté activa, emite tu voto en pocos pasos.",
  },
];

const principles = [
  {
    icon: <VerifiedUserOutlined />,
    title: "Identidad verificada",
    description: "Iniciar sesión confirma tu derecho a participar, sin revelar tu selección.",
  },
  {
    icon: <KeyOutlined />,
    title: "Voto cifrado",
    description: "Tu boleta se cifra en tu navegador antes de enviarse y solo se descifra en el conteo agregado.",
  },
  {
    icon: <LockOutlined />,
    title: "Identidad separada del voto",
    description: "Una firma ciega autoriza tu voto sin que el sistema pueda asociarlo contigo.",
  },
];

function IconTile({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={(theme) => ({
        display: "grid",
        placeItems: "center",
        width: 40,
        height: 40,
        borderRadius: 2.5,
        color: "primary.main",
        bgcolor: alpha(theme.palette.primary.main, 0.1),
      })}
    >
      {children}
    </Box>
  );
}

function HomePage() {
  const { authenticated, roles, handleRegister } = useKeycloak();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <PublicHeader
        actions={
          authenticated ? (
            <Button component={RouterLink} to={getHomePath(roles)} variant="contained" size="small">
              Ir a mi panel
            </Button>
          ) : (
            <Button component={RouterLink} to="/login" size="small" sx={{ color: "text.primary" }}>
              Iniciar sesión
            </Button>
          )
        }
      />

      <Container component="main" maxWidth="lg">
        <Box sx={{ py: { xs: 8, md: 14 }, maxWidth: 760 }}>
          <Typography variant="overline" color="primary">
            Elecciones institucionales
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: "2.6rem", md: "4rem" }, mt: 1.5 }}>
            Vota con privacidad y confianza.
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: "1.05rem", md: "1.175rem" }, lineHeight: 1.7, mt: 3, maxWidth: 600 }}>
            Un sistema de votación electrónica donde cada participante está verificado
            y cada voto permanece anónimo de principio a fin.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 5 }}>
            {authenticated ? (
              <Button component={RouterLink} to={getHomePath(roles)} variant="contained" size="large" endIcon={<ArrowForward />}>
                Ir a mi panel
              </Button>
            ) : (
              <>
                <Button component={RouterLink} to="/login" variant="contained" size="large" endIcon={<ArrowForward />}>
                  Iniciar sesión
                </Button>
                <Button onClick={handleRegister} variant="outlined" size="large" sx={{ color: "text.primary" }}>
                  Crear cuenta
                </Button>
              </>
            )}
          </Stack>
        </Box>

        <Divider />

        <Box component="section" aria-labelledby="como-funciona" sx={{ py: { xs: 7, md: 10 } }}>
          <Typography id="como-funciona" variant="overline" color="text.secondary">
            Cómo participar
          </Typography>
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ mt: 2 }}>
            {steps.map((step, index) => (
              <Grid key={step.title} size={{ xs: 12, md: 4 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <IconTile>{step.icon}</IconTile>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Paso {index + 1}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ mt: 2 }}>{step.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>{step.description}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider />

        <Box component="section" aria-labelledby="privacidad" sx={{ py: { xs: 7, md: 10 } }}>
          <Grid container spacing={{ xs: 4, md: 8 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography id="privacidad" variant="h4" component="h2">
                Una decisión libre necesita privacidad.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3.5}>
                {principles.map((item) => (
                  <Stack key={item.title} direction="row" spacing={2.5}>
                    <IconTile>{item.icon}</IconTile>
                    <Box>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }}>{item.description}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Box component="footer" sx={{ borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Votación Anónima · Sistema de votación electrónica
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;
