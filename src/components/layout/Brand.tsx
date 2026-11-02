import { HowToVoteOutlined } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

type BrandProps = { to?: string };

/** Marca de la aplicación: isotipo y nombre. */
function Brand({ to = "/" }: BrandProps) {
  return (
    <Stack
      component={RouterLink}
      to={to}
      direction="row"
      spacing={1.25}
      sx={{ alignItems: "center", color: "text.primary", textDecoration: "none" }}
      aria-label="Votación Anónima, ir al inicio"
    >
      <Box
        sx={(theme) => ({
          display: "grid",
          placeItems: "center",
          width: 30,
          height: 30,
          borderRadius: 2,
          color: "primary.main",
          bgcolor: alpha(theme.palette.primary.main, 0.12),
        })}
      >
        <HowToVoteOutlined sx={{ fontSize: 18 }} />
      </Box>
      <Typography sx={{ fontWeight: 600, letterSpacing: "-0.01em" }}>Votación Anónima</Typography>
    </Stack>
  );
}

export default Brand;
