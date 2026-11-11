import { Alert, Box, Button, Chip, Paper, Skeleton, Stack, Typography } from "@mui/material";
import useElectionKeys, { type KeyLookup } from "../../hooks/election-service/useElectionKeys";
import type { ElectionDetails } from "../../services/election-service/election.types";
import { KEY_STATUS_META, truncateMiddle, type KeyStatus } from "../../utils/keyStatus";
import KeyStatusChip from "./KeyStatusChip";

type ElectionKeysPanelProps = {
  election: ElectionDetails;
};

type KeyView = {
  value: string;
  status: KeyStatus;
  /** Aclara que el valor mostrado no es la clave completa. */
  note?: string;
};

type KeyCardProps = {
  title: string;
  /** `null` mientras se consulta. */
  lookup: KeyLookup<KeyView> | null;
  onRetry: () => void;
};

function KeyCard({ title, lookup, onRetry }: KeyCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 0, borderColor: "divider" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="subtitle2">{title}</Typography>
        {lookup?.state === "found" && <KeyStatusChip status={lookup.key.status} size="small" />}
        {lookup?.state === "missing" && <Chip label="Sin generar" size="small" />}
      </Stack>

      {!lookup && <Skeleton sx={{ mt: 1 }} aria-label="Consultando clave" />}

      {lookup?.state === "found" && (
        <>
          <Typography
            component="code"
            variant="body2"
            sx={{ display: "block", mt: 1, fontFamily: "monospace", wordBreak: "break-all" }}
          >
            {lookup.key.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {KEY_STATUS_META[lookup.key.status].description}
            {lookup.key.note ? ` ${lookup.key.note}` : ""}
          </Typography>
        </>
      )}

      {lookup?.state === "missing" && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Esta clave todavía no se ha generado.
        </Typography>
      )}

      {lookup?.state === "error" && (
        <Alert
          severity="error"
          sx={{ mt: 1 }}
          action={<Button color="inherit" size="small" onClick={onRetry}>Reintentar</Button>}
        >
          {lookup.message}
        </Alert>
      )}
    </Paper>
  );
}

const toView = <T,>(lookup: KeyLookup<T> | null, map: (key: T) => KeyView): KeyLookup<KeyView> | null =>
  lookup?.state === "found" ? { state: "found", key: map(lookup.key) } : lookup;

/** Muestra las claves públicas de la elección y su estado, para comprobar que existen y se habilitaron. */
function ElectionKeysPanel({ election }: ElectionKeysPanelProps) {
  const { enabled, authorization, encryption, reload } = useElectionKeys(election);

  if (!enabled) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="overline" color="text.secondary">Claves criptográficas</Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 0.5 }}>
        <KeyCard
          title="Clave pública de autorización"
          lookup={toView(authorization, (key) => ({
            value: truncateMiddle(key.publicKey.n),
            status: key.keyStatus,
            note: "Se muestra abreviada.",
          }))}
          onRetry={reload}
        />
        <KeyCard
          title="Clave pública de cifrado"
          lookup={toView(encryption, (key) => ({ value: key.publicKey, status: key.status }))}
          onRetry={reload}
        />
      </Stack>
    </Box>
  );
}

export default ElectionKeysPanel;
