import { Chip, type ChipProps } from "@mui/material";
import type { ElectionStatus } from "../../services/election-service/election.types";
import { ELECTION_STATUS_META } from "../../utils/electionStatus";

type ElectionStatusChipProps = Omit<ChipProps, "label" | "color"> & {
  status: ElectionStatus;
};

/** Indicador visual único del estado de una elección. */
function ElectionStatusChip({ status, ...props }: ElectionStatusChipProps) {
  const { label, color } = ELECTION_STATUS_META[status];
  return <Chip label={label} color={color} {...props} />;
}

export default ElectionStatusChip;
