import { Chip, type ChipProps } from "@mui/material";
import { KEY_STATUS_META, type KeyStatus } from "../../utils/keyStatus";

type KeyStatusChipProps = Omit<ChipProps, "label" | "color"> & {
  status: KeyStatus;
};

/** Indicador visual único del estado de una clave criptográfica. */
function KeyStatusChip({ status, ...props }: KeyStatusChipProps) {
  const { label, color } = KEY_STATUS_META[status];
  return <Chip label={label} color={color} {...props} />;
}

export default KeyStatusChip;
