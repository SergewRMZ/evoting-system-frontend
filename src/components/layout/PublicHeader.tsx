import type { ReactNode } from "react";
import { Container, Stack } from "@mui/material";
import Brand from "./Brand";
import ColorModeButton from "./ColorModeButton";

/** Cabecera de las páginas públicas (inicio, acceso). */
function PublicHeader({ actions }: { actions?: ReactNode }) {
  return (
    <Container maxWidth="lg">
      <Stack direction="row" spacing={1} sx={{ py: 2.5, alignItems: "center" }}>
        <Brand />
        <Stack direction="row" spacing={1} sx={{ ml: "auto", alignItems: "center" }}>
          <ColorModeButton />
          {actions}
        </Stack>
      </Stack>
    </Container>
  );
}

export default PublicHeader;
