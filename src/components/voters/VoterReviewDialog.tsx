import { useState, type ReactNode } from "react";
import { CheckCircleOutlined, HowToRegOutlined, InfoOutlined, WarningAmber } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { VoterRegistration } from "../../services/authentication-service/voters.types";
import votersApi, { getApprovalErrorMessage, getApprovalRejection } from "../../services/authentication-service/voters.api";
import VoterStatusChip from "./VoterStatusChip";
import { formatDateTime, fullNameOf } from "./voterFormat";

type VoterReviewDialogProps = {
  registration: VoterRegistration | null;
  onClose: () => void;
  /** Se invoca tras aprobar (o si el registro cambió en el servidor), para refrescar la lista. */
  onApproved: (registration: VoterRegistration) => void;
  onStale: () => void;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" }, gap: { xs: 0.25, sm: 2 }, py: 1.25 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Box sx={{ minWidth: 0, typography: "body2", overflowWrap: "anywhere" }}>{children}</Box>
    </Box>
  );
}

function Check({ ok, warning, children }: { ok: boolean; warning?: boolean; children: ReactNode }) {
  const icon = ok
    ? <CheckCircleOutlined color="success" fontSize="small" />
    : warning
      ? <InfoOutlined color="warning" fontSize="small" />
      : <WarningAmber color="error" fontSize="small" />;
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      {icon}
      <Typography variant="body2">{children}</Typography>
    </Stack>
  );
}

/** Revisión de un registro antes de aprobarlo como votante. */
function VoterReviewDialog({ registration, onClose, onApproved, onStale }: VoterReviewDialogProps) {
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  const pending = registration?.status === "PENDING";
  const blockers = registration
    ? [
        !registration.matriculaValid && "La matrícula no es válida.",
        !registration.enabled && "La cuenta está deshabilitada.",
      ].filter(Boolean)
    : [];

  const handleClose = () => {
    if (approving) return;
    setError("");
    onClose();
  };

  const approve = async () => {
    if (!registration || approving) return;
    setApproving(true);
    setError("");
    try {
      const approved = await votersApi.approve(registration.userId);
      onApproved(approved);
    } catch (approveError) {
      setError(getApprovalErrorMessage(approveError));
      // Si el registro cambió en el servidor (p. ej. otro admin lo aprobó), la lista está desactualizada.
      if (getApprovalRejection(approveError) === "ALREADY_APPROVED") onStale();
    } finally {
      setApproving(false);
    }
  };

  return (
    <Dialog open={Boolean(registration)} onClose={handleClose} fullWidth maxWidth="sm" aria-labelledby="voter-review-title">
      {registration && (
        <>
          <DialogTitle id="voter-review-title" component="div">
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6" component="h2">{pending ? "Revisar solicitud" : "Detalle del votante"}</Typography>
              <VoterStatusChip registration={registration} />
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Box>
              <Field label="Nombre">{fullNameOf(registration) || "Sin nombre"}</Field>
              <Divider />
              <Field label="Matrícula">
                <Box component="span" sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 600, letterSpacing: "0.04em" }}>
                  {registration.matricula ?? "—"}
                </Box>
              </Field>
              <Divider />
              <Field label="Usuario">{registration.username}</Field>
              <Divider />
              <Field label="Correo">{registration.email ?? "—"}</Field>
              <Divider />
              <Field label="Registrado">{formatDateTime(registration.registeredAt)}</Field>
            </Box>

            {pending && (
              <Stack spacing={1} sx={{ mt: 2.5, p: 2, borderRadius: 2, border: 1, borderColor: "divider" }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Antes de aprobar</Typography>
                <Check ok={registration.matriculaValid}>
                  {registration.matriculaValid ? "La matrícula tiene 10 dígitos" : "La matrícula falta o no tiene 10 dígitos"}
                </Check>
                <Check ok={registration.enabled}>{registration.enabled ? "La cuenta está habilitada" : "La cuenta está deshabilitada"}</Check>
                <Check ok={registration.emailVerified} warning>
                  {registration.emailVerified ? "El correo está verificado" : "El correo aún no está verificado"}
                </Check>
                <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                  Comprueba que la matrícula corresponda a una persona con derecho a votar. Al aprobar, la cuenta recibirá
                  el rol de votante y podrá participar en las elecciones activas.
                </Typography>
              </Stack>
            )}

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={handleClose} disabled={approving} sx={{ color: "text.secondary" }}>
              {pending ? "Cancelar" : "Cerrar"}
            </Button>
            {pending && (
              <Button
                variant="contained"
                onClick={() => void approve()}
                disabled={approving || blockers.length > 0}
                startIcon={approving ? <CircularProgress size={16} color="inherit" /> : <HowToRegOutlined />}
              >
                {approving ? "Aprobando..." : "Aprobar como votante"}
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export default VoterReviewDialog;
