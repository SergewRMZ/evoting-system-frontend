import type { ReactNode } from "react";
import {
  CheckCircleOutlined,
  ErrorOutlined,
  RadioButtonUnchecked,
  RemoveCircleOutlined,
  WarningAmber,
  ArrowForward,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import type { ElectionStatus } from "../services/election-service/election.types";
import type { OperationStep } from "../services/election-service/election-lifecycle";
import type { OperationPhase } from "../hooks/election-service/useElectionOperation";
import ElectionStatusChip from "./election/ElectionStatusChip";

export type OperationRequirement = {
  label: string;
  /** `true` cumplido, `false` no cumplido, `undefined` solo informativo. */
  met?: boolean;
  /** Si es `false`, no cumplirlo muestra una advertencia pero no bloquea la operación. */
  blocking?: boolean;
};

type OperationDialogProps = {
  open: boolean;
  title: string;
  /** Explicación de qué hace la operación. */
  description: ReactNode;
  fromStatus: ElectionStatus;
  toStatus: ElectionStatus;
  requirements?: OperationRequirement[];
  consequences?: string[];
  steps: OperationStep[];
  phase: OperationPhase;
  confirmLabel: string;
  /** Texto del botón cuando una ejecución previa falló parcialmente. */
  retryLabel?: string;
  successMessage: string;
  onConfirm: () => void;
  onClose: () => void;
};

const stepIcon = (step: OperationStep) => {
  switch (step.status) {
    case "running":
      return <CircularProgress size={20} aria-label="En proceso" />;
    case "done":
      return <CheckCircleOutlined color="success" fontSize="small" />;
    case "skipped":
      return <RemoveCircleOutlined color="disabled" fontSize="small" />;
    case "error":
      return <ErrorOutlined color="error" fontSize="small" />;
    default:
      return <RadioButtonUnchecked color="disabled" fontSize="small" />;
  }
};

/**
 * Diálogo de confirmación para operaciones importantes: explica la operación,
 * muestra requisitos y consecuencias, y reporta el progreso paso a paso.
 * Mientras la operación está en curso no puede cerrarse ni volver a confirmarse.
 */
function OperationDialog({
  open,
  title,
  description,
  fromStatus,
  toStatus,
  requirements = [],
  consequences = [],
  steps,
  phase,
  confirmLabel,
  retryLabel = "Reintentar pasos pendientes",
  successMessage,
  onConfirm,
  onClose,
}: OperationDialogProps) {
  const running = phase === "running";
  const blocked = requirements.some((item) => item.met === false && item.blocking !== false);
  const failedStep = steps.find((step) => step.status === "error");

  const handleClose = () => {
    if (!running) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="operation-dialog-title"
    >
      <DialogTitle id="operation-dialog-title" sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Typography color="text.secondary">{description}</Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }} aria-label="Cambio de estado">
            <ElectionStatusChip status={fromStatus} size="small" />
            <ArrowForward fontSize="small" color="disabled" />
            <ElectionStatusChip status={toStatus} size="small" />
          </Stack>

          {phase === "idle" && (
            <>
              {requirements.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Requisitos</Typography>
                  <List dense disablePadding>
                    {requirements.map((item) => (
                      <ListItem key={item.label} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {item.met === false ? (
                            <WarningAmber color={item.blocking === false ? "warning" : "error"} fontSize="small" />
                          ) : (
                            <CheckCircleOutlined color={item.met ? "success" : "disabled"} fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {consequences.length > 0 && (
                <Alert severity="warning" icon={<WarningAmber />}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Qué ocurrirá</Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {consequences.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </Box>
                </Alert>
              )}
            </>
          )}

          {phase !== "idle" && (
            <Box>
              {running && <LinearProgress sx={{ mb: 1.5 }} aria-label="Procesando operación" />}
              <List dense disablePadding aria-label="Progreso de la operación">
                {steps.map((step) => (
                  <ListItem key={step.id} disableGutters alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>{stepIcon(step)}</ListItemIcon>
                    <ListItemText
                      primary={step.label}
                      secondary={step.error ?? step.note}
                      slotProps={{ secondary: { color: step.error ? "error" : "text.secondary" } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {phase === "success" && <Alert severity="success">{successMessage}</Alert>}
          {phase === "error" && (
            <Alert severity="error">
              La operación no se completó{failedStep ? `: ${failedStep.error}` : "."} Los pasos ya realizados se conservan; al reintentar solo se ejecutarán los pendientes.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {phase === "success" ? (
          <Button variant="contained" onClick={onClose}>Cerrar</Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={running}>
              {phase === "error" ? "Cerrar" : "Cancelar"}
            </Button>
            <Button
              variant="contained"
              onClick={onConfirm}
              disabled={running || (phase === "idle" && blocked)}
              startIcon={running ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {running ? "Procesando..." : phase === "error" ? retryLabel : confirmLabel}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default OperationDialog;
