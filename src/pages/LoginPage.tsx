import { LockOutlined, HowToVoteOutlined } from "@mui/icons-material";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useKeycloak } from "../auth/useKeycloak";

function LoginPage() {
  const { handleLogin } = useKeycloak();
  
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", py: 5, background: "radial-gradient(ellipse at 50% 0%, rgba(126,104,239,.14), transparent 50%), #09090b" }}>
      <Container maxWidth="sm">
        <Stack sx={{ mb: 4, color: "white", alignItems: "center" }}>
          <Box sx={{ bgcolor: "rgba(114,230,177,.12)", color: "secondary.main", borderRadius: 2, p: 1.2, display: "flex", mb: 2 }}><HowToVoteOutlined /></Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>VotoClaro</Typography>
          <Typography sx={{ color: "text.secondary", mt: 1 }}>Acceso seguro a tu elección</Typography>
        </Stack>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, borderColor: "divider", bgcolor: "background.paper" }}>
          <Typography variant="h4" sx={{ fontSize: "2rem" }}>Identifica tu participación</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 4, lineHeight: 1.6 }}>
            Te redirigiremos a Keycloak para validar tu identidad. La autenticación habilita tu participación, pero no revela ni vincula tus selecciones.
          </Typography>
          <Stack spacing={2.5}>
            <Button onClick={handleLogin} variant="contained" size="large" startIcon={<LockOutlined />} sx={{ py: 1.5, mt: 1 }}>
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