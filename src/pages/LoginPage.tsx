import { DarkModeOutlined, LightModeOutlined, LockOutlined, HowToVoteOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useKeycloak } from "../auth/useKeycloak";
import { ColorModeContext } from "../theme/ColorModeContext";
function LoginPage() {
  const { handleLogin, authError } = useKeycloak();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const [loginError, setLoginError] = useState("");

  const startLogin = async () => {
    setLoginError("");
    try {
      await handleLogin();
    } catch {
      setLoginError("No se pudo iniciar sesión. Inténtalo nuevamente o contacta al administrador.");
    }
  };
  
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", py: 5, position: "relative", background: (theme) => `radial-gradient(ellipse at 50% 0%, rgba(126,104,239,.14), transparent 50%), ${theme.palette.background.default}` }}>
      <Button
        onClick={toggleColorMode}
        startIcon={mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
        aria-label={mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        sx={{ position: "absolute", top: 16, right: 16 }}
      >
        {mode === "dark" ? "Modo claro" : "Modo oscuro"}
      </Button>
      <Container maxWidth="sm">
        <Stack sx={{ mb: 4, color: "text.primary", alignItems: "center" }}>
          <Box sx={{ bgcolor: "rgba(114,230,177,.12)", color: "secondary.main", borderRadius: 2, p: 1.2, display: "flex", mb: 2 }}><HowToVoteOutlined /></Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Votación Anónima</Typography>
          <Typography sx={{ color: "text.secondary", mt: 1 }}>Acceso seguro y autenticado a tu elección</Typography>
        </Stack>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, borderColor: "divider", bgcolor: "background.paper" }}>
          <Typography variant="h4" sx={{ fontSize: "2rem" }}>Identifica tu participación</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 4, lineHeight: 1.6 }}>
            Te redirigiremos a Keycloak para validar tu identidad. La autenticación habilita tu participación, pero no vínculamos tu identidad con tu voto.
          </Typography>
          {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
          {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}
          <Stack spacing={2.5}>
            <Button onClick={() => void startLogin()} variant="contained" size="large" startIcon={<LockOutlined />} sx={{ py: 1.5, mt: 1 }}>
              Continuar con Keycloak
            </Button>
          </Stack>
          <Button component={RouterLink} to="/" fullWidth sx={{ mt: 2, color: "text.secondary" }}>Volver al inicio</Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;