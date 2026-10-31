import { useEffect } from "react";
import {
  Alert,
  Box,
  Collapse,
  IconButton,
  Portal,
  Stack,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { useGlobalError } from "../errors/GlobalErrorContext";

const AUTO_DISMISS_MS = 8000;

/**
 * Banda de notificaciones globales fijada en la parte superior de la pantalla.
 * Se monta una sola vez en App.tsx y reacciona al contexto GlobalErrorContext.
 */
function GlobalAlertBanner() {
  const { alerts, dismissAlert } = useGlobalError();

  // Auto-dismiss para alertas de tipo info/success/warning
  useEffect(() => {
    if (alerts.length === 0) return;
    const latest = alerts[alerts.length - 1];
    if (latest.severity === "error") return; // errores persisten hasta cierre manual

    const timer = setTimeout(() => dismissAlert(latest.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [alerts, dismissAlert]);

  if (alerts.length === 0) return null;

  return (
    <Portal>
      <Box
        role="region"
        aria-label="Notificaciones del sistema"
        sx={{
          position: "fixed",
          top: { xs: 8, sm: 16 },
          left: "50%",
          transform: "translateX(-50%)",
          width: { xs: "calc(100% - 32px)", sm: 520 },
          zIndex: (theme) => theme.zIndex.snackbar,
          pointerEvents: "none",
        }}
      >
        <Stack spacing={1} sx={{ pointerEvents: "auto" }}>
          {alerts.map((alert) => (
            <Collapse key={alert.id} in unmountOnExit>
              <Alert
                severity={alert.severity}
                role={alert.severity === "error" ? "alert" : "status"}
                variant="filled"
                sx={{ boxShadow: 4, borderRadius: 2 }}
                action={
                  <IconButton
                    size="small"
                    aria-label="Cerrar notificación"
                    color="inherit"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <CloseOutlined fontSize="small" />
                  </IconButton>
                }
              >
                {alert.message}
              </Alert>
            </Collapse>
          ))}
        </Stack>
      </Box>
    </Portal>
  );
}

export default GlobalAlertBanner;

