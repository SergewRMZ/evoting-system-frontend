import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  CheckCircleOutlined,
  LockOpenOutlined,
  PlayCircleOutlined,
  SettingsOutlined,
  CalculateOutlined,
} from "@mui/icons-material";
import { Alert, Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { ElectionDetails } from "../../services/election-service/election.types";
import {
  ELECTION_STATUS_META,
  currentTimeMs,
  getElectionActions,
  getNextStepHint,
  type ElectionAction,
  type ElectionActionGroup,
  type ElectionActionId,
  type ElectionRoles,
} from "../../utils/electionStatus";
import ElectionLifecycleStepper from "./ElectionLifecycleStepper";
import ElectionStatusChip from "./ElectionStatusChip";
import ElectionValidationDialog from "./ElectionValidationDialog";
import ElectionActivationDialog from "./ElectionActivationDialog";
import ElectionTallyDialog from "./ElectionTallyDialog";
import ElectionKeysPanel from "./ElectionKeysPanel";

type ElectionManagementPanelProps = {
  election: ElectionDetails;
  roles: ElectionRoles;
  /** Vuelve a cargar la elección después de una operación que cambió su estado. */
  onChanged: () => void;
};

const GROUP_TITLES: Record<ElectionActionGroup, string> = {
  configuration: "Configuración",
  validation: "Validación",
  activation: "Activación",
  tally: "Escrutinio",
};

const ACTION_ICONS: Record<ElectionActionId, ReactNode> = {
  configure: <SettingsOutlined />,
  validate: <CheckCircleOutlined />,
  "complete-validation": <LockOpenOutlined />,
  activate: <PlayCircleOutlined />,
  "complete-activation": <LockOpenOutlined />,
  tally: <CalculateOutlined />,
};

/**
 * Panel de gestión del ciclo de vida: etapa actual, siguiente paso y las acciones
 * disponibles según el estado y el rol. Las operaciones de validación, activación
 * y escrutinio siempre pasan por un diálogo de confirmación.
 */
function ElectionManagementPanel({ election, roles, onChanged }: ElectionManagementPanelProps) {
  const [openDialog, setOpenDialog] = useState<"validation" | "activation" | "tally" | null>(null);
  const [openedAt, setOpenedAt] = useState(0);
  const actions = getElectionActions(election.status, roles);

  const groups = (Object.keys(GROUP_TITLES) as ElectionActionGroup[])
    .map((group) => ({ group, items: actions.filter((action) => action.group === group) }))
    .filter(({ items }) => items.length > 0);

  const openActivation = () => {
    setOpenedAt(currentTimeMs());
    setOpenDialog("activation");
  };

  const handleAction = (action: ElectionAction) => {
    if (action.id === "validate" || action.id === "complete-validation") setOpenDialog("validation");
    else if (action.id === "activate" || action.id === "complete-activation") openActivation();
    else if (action.id === "tally") setOpenDialog("tally");
  };

  const handleDialogClose = (changed: boolean) => {
    setOpenDialog(null);
    if (changed) onChanged();
  };

  return (
    <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Estado y acciones de la elección</Typography>

      <ElectionLifecycleStepper status={election.status} />

      <Paper variant="outlined" sx={{ mt: 3, p: 2, borderColor: "divider" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <ElectionStatusChip status={election.status} size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 200 }}>
            {ELECTION_STATUS_META[election.status].description}
          </Typography>
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="body2">
          <strong>Siguiente paso:</strong> {getNextStepHint(election.status, roles)}
        </Typography>
      </Paper>

      {groups.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>No hay acciones de gestión disponibles para tu rol en este estado.</Alert>
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {groups.map(({ group, items }) => (
            <Box key={group}>
              <Typography variant="overline" color="text.secondary">{GROUP_TITLES[group]}</Typography>
              <Stack spacing={1} sx={{ mt: 0.5 }}>
                {items.map((action) => (
                  <Box key={action.id}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" } }}>
                      {action.id === "configure" ? (
                        <Button
                          component={RouterLink}
                          to={`/admin/elections/${election.electionId}`}
                          variant={action.primary ? "contained" : "outlined"}
                          startIcon={ACTION_ICONS[action.id]}
                          disabled={!action.enabled}
                        >
                          {action.label}
                        </Button>
                      ) : (
                        <Button
                          variant={action.primary ? "contained" : "outlined"}
                          startIcon={ACTION_ICONS[action.id]}
                          disabled={!action.enabled}
                          onClick={() => handleAction(action)}
                        >
                          {action.label}
                        </Button>
                      )}
                      {!action.enabled && action.reason && (
                        <Typography variant="body2" color="text.secondary">{action.reason}</Typography>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <ElectionKeysPanel election={election} />

      <ElectionValidationDialog open={openDialog === "validation"} election={election} onClose={handleDialogClose} />
      <ElectionActivationDialog open={openDialog === "activation"} election={election} openedAt={openedAt} onClose={handleDialogClose} />
      <ElectionTallyDialog open={openDialog === "tally"} election={election} onClose={handleDialogClose} />
    </Box>
  );
}

export default ElectionManagementPanel;
