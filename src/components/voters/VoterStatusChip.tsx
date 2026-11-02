import { Chip } from "@mui/material";
import type { VoterRegistration } from "../../services/authentication-service/voters.types";

/** Estado visible de un registro: aprobado, pendiente o cuenta deshabilitada. */
function VoterStatusChip({ registration }: { registration: Pick<VoterRegistration, "status" | "enabled"> }) {
  if (!registration.enabled) return <Chip size="small" color="error" label="Deshabilitada" />;
  return registration.status === "APPROVED"
    ? <Chip size="small" color="success" label="Aprobado" />
    : <Chip size="small" color="warning" label="Pendiente" />;
}

export default VoterStatusChip;
