import { useState } from "react";
import { HourglassEmptyOutlined, RefreshOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Navigate, useNavigate } from "react-router-dom";
import { useKeycloak } from "../auth/useKeycloak";
import { getHomePath, hasAppRole } from "../auth/roles";
import PublicHeader from "../components/layout/PublicHeader";

/** Página para cuentas registradas que todavía no han sido aprobadas como votantes. */
function PendingAccountPage() {
  const { roles, profile, refreshRoles, handleLogout } = useKeycloak();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ severity: "info" | "error"; message: string } | null>(null);

  if (hasAppRole(roles)) return <Navigate to={getHomePath(roles)} replace />;

  const checkStatus = async () => {
    setChecking(true);
    setFeedback(null);
    try {
      const current = await refreshRoles();
      if (hasAppRole(current)) {
        navigate(getHomePath(current), { replace: true });
        return;
      }
      setFeedback({ severity: "info", message: "Tu registro sigue en revisión. Vuelve a comprobarlo más tarde." });
    } catch {
      setFeedback({ severity: "error", message: "No se pudo comprobar el estado. Inicia sesión de nuevo si el problema continúa." });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <PublicHeader />
      <Container maxWidth="sm" sx={{ flex: 1, display: "flex", alignItems: "center", py: 6 }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, width: "100%" }}>
          <Box
            sx={(theme) => ({
              display: "grid",
              placeItems: "center",
              width: 44,
              height: 44,
              borderRadius: 2.5,
              color: "warning.main",
              bgcolor: alpha(theme.palette.warning.main, 0.12),
            })}
          >
            <HourglassEmptyOutlined />
          </Box>
          <Typography variant="h5" component="h1" sx={{ mt: 3 }}>
            Tu registro está en revisión
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            {profile?.name ? `${profile.name}, recibimos` : "Recibimos"} tu solicitud. Un administrador verificará tu
            matrícula y habilitará tu cuenta como votante. Mientras tanto no podrás consultar ni participar en elecciones.
          </Typography>

          {profile?.email && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Cuenta: <Box component="span" sx={{ color: "text.primary", fontWeight: 500 }}>{profile.email}</Box>
            </Typography>
          )}

          {feedback && <Alert severity={feedback.severity} sx={{ mt: 3 }}>{feedback.message}</Alert>}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<RefreshOutlined />}
              onClick={() => void checkStatus()}
              disabled={checking}
            >
              {checking ? "Comprobando..." : "Comprobar estado"}
            </Button>
            <Button onClick={handleLogout} sx={{ color: "text.secondary" }}>
              Cerrar sesión
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default PendingAccountPage;
