import { useState, type FormEvent } from "react";
import { Add, SaveOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  emptyElectionForm,
  hasFormErrors,
  isSameElectionForm,
  toElectionRequest,
  validateElectionForm,
  type ElectionFormErrors,
  type ElectionFormValues,
} from "../../utils/electionForm";
import type { CreateElectionRequest } from "../../services/election-service/election.types";

type ElectionFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  /** Valores iniciales (obligatorio en modo edición). */
  initialValues?: ElectionFormValues;
  onClose: () => void;
  /** Debe rechazar con un `Error` cuyo mensaje se mostrará al usuario. */
  onSubmit: (request: CreateElectionRequest) => Promise<void>;
};

/** Formulario compartido para crear una elección y para editar su configuración. */
function ElectionFormDialog({ open, mode, initialValues = emptyElectionForm, onClose, onSubmit }: ElectionFormDialogProps) {
  const [values, setValues] = useState<ElectionFormValues>(initialValues);
  const [errors, setErrors] = useState<ElectionFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const editing = mode === "edit";
  const unchanged = editing && isSameElectionForm(values, initialValues);

  const setField = (field: keyof ElectionFormValues) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const validation = validateElectionForm(values);
    setErrors(validation);
    setSubmitError("");
    if (hasFormErrors(validation)) return;

    setSubmitting(true);
    try {
      await onSubmit(toElectionRequest(values));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo guardar la elección.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        transition: {
          // Reinicia el formulario cada vez que se abre, con los valores vigentes.
          onEnter: () => {
            setValues(initialValues);
            setErrors({});
            setSubmitError("");
          },
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="overline" color="secondary.main">
            {editing ? "EDITAR ELECCIÓN" : "NUEVA ELECCIÓN · PASO 1 DE 2"}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>Datos generales</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {editing
              ? "Puedes corregir estos datos mientras la elección esté en borrador. Una vez publicada ya no podrá modificarse."
              : "Al continuar, la elección se guardará como borrador. En el siguiente paso podrás añadir cargos y candidaturas antes de publicarla."}
          </Typography>
          <Stack spacing={2}>
            <TextField
              autoFocus
              label="Nombre de la elección"
              value={values.name}
              onChange={setField("name")}
              error={Boolean(errors.name)}
              helperText={errors.name}
              required
            />
            <TextField
              label="Descripción"
              value={values.description}
              onChange={setField("description")}
              error={Boolean(errors.description)}
              helperText={errors.description}
              required
              multiline
              minRows={3}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Inicio"
                type="datetime-local"
                value={values.startDate}
                onChange={setField("startDate")}
                error={Boolean(errors.startDate)}
                helperText={errors.startDate}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                label="Finalización"
                type="datetime-local"
                value={values.endDate}
                onChange={setField("endDate")}
                error={Boolean(errors.endDate)}
                helperText={errors.endDate}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Stack>
            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={submitting}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={editing ? <SaveOutlined /> : <Add />}
            disabled={submitting || unchanged}
          >
            {submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear y continuar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ElectionFormDialog;
