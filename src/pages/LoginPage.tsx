import { useState } from "react";
import { LockOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useKeycloak } from "../auth/useKeycloak";
import { getHomePath } from "../auth/roles";
import PublicHeader from "../components/layout/PublicHeader";

function LoginPage() {
  const { authenticated, roles, handleLogin, handleRegister, authError } = useKeycloak();
  const [redirectError, setRedirectError] = useState("");

  if (authenticated) return <Navigate to={getHomePath(roles)} replace />;

  const run = async (action: () => void | Promise<void>) => {
    setRedirectError("");
    try {
      await action();
    } catch {
      setRedirectError("No se pudo abrir el proveedor de identidad. Inténtalo de nuevo en unos momentos.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <PublicHeader />
      <Container maxWidth="xs" sx={{ flex: 1, display: "flex", alignItems: "center", py: 6 }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, width: "100%" }}>
          <Typography variant="h5" component="h1">Inicia sesión</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Te llevaremos a la página segura de inicio de sesión. Tu identidad habilita tu participación,
            pero nunca se vincula con tu voto.
          </Typography>

          <Stack spacing={2} sx={{ mt: 3 }}>
            {authError && <Alert severity="error">{authError}</Alert>}
            {redirectError && <Alert severity="error">{redirectError}</Alert>}
            <Button
              onClick={() => void run(handleLogin)}
              variant="contained"
              size="large"
              startIcon={<LockOutlined />}
              disabled={Boolean(authError)}
              fullWidth
            >
              Continuar
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2">¿Aún no tienes cuenta?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Regístrate con tu matrícula de 10 dígitos. Podrás votar cuando un administrador valide tu registro.
          </Typography>
          <Button
            onClick={() => void run(handleRegister)}
            variant="outlined"
            fullWidth
            disabled={Boolean(authError)}
            sx={{ mt: 2, color: "text.primary" }}
          >
            Crear cuenta
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
