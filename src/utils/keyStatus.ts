import type { AuthorizationPublicKeyStatus } from "../services/authorization-service/authorization.types";
import type { ElGamalPublicKeyStatus } from "../services/tally-service/tally-service.types";
import type { ElectionStatus } from "../services/election-service/election.types";
import type { StatusColor } from "./electionStatus";

export type KeyStatus = AuthorizationPublicKeyStatus | ElGamalPublicKeyStatus;

type KeyStatusMeta = {
  label: string;
  color: StatusColor;
  description: string;
};

export const KEY_STATUS_META: Record<KeyStatus, KeyStatusMeta> = {
  CREATED: {
    label: "Creada",
    color: "warning",
    description: "La clave existe y se habilitará al activar la elección.",
  },
  ACTIVE: {
    label: "Activa",
    color: "success",
    description: "La clave está habilitada para el proceso de votación.",
  },
  EXPIRED: {
    label: "Expirada",
    color: "error",
    description: "La clave ya no está vigente.",
  },
};

/** Las claves se generan al validar la elección; antes de ese punto no hay nada que consultar. */
const STAGES_WITH_KEYS: ElectionStatus[] = ["VERIFIED", "ACTIVE", "CLOSED", "FINISHED"];

export const electionHasKeys = (status: ElectionStatus) => STAGES_WITH_KEYS.includes(status);

/** Abrevia una cadena larga conservando su inicio y su final, que bastan para cotejarla. */
export const truncateMiddle = (value: string, head = 16, tail = 12) =>
  value.length <= head + tail + 1 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
