import { DarkModeOutlined, HowToVoteOutlined, LightModeOutlined, LogoutOutlined, ShieldOutlined } from "@mui/icons-material";
import { useContext } from "react";
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useKeycloak } from "../auth/useKeycloak";
import { ColorModeContext } from "../theme/ColorModeContext";

function Navbar() {
  const { handleLogout, authenticated, roles } = useKeycloak();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isAuthority = roles.includes("ROLE_AUTHORITY");

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <HowToVoteOutlined sx={{ color: "secondary.main" }} />
            <Typography component={RouterLink} to="/" sx={{ color: "text.primary", textDecoration: "none", fontWeight: 700, letterSpacing: "-.03em" }}>Votación Anónima</Typography>
          </Stack>
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1.5 }} sx={{ alignItems: "center" }}>
            <Button
              color="inherit"
              onClick={toggleColorMode}
              aria-label={mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              startIcon={mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
              sx={{ color: "text.secondary", minWidth: { xs: 40, sm: "auto" } }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                {mode === "dark" ? "Modo claro" : "Modo oscuro"}
              </Box>
            </Button>
            {authenticated && (
              <>
                <Button component={RouterLink} to="/vote" color="inherit" sx={{ color: "text.secondary" }}>
                  Elecciones
                </Button>
                {isAuthority && (
                  <Button component={RouterLink} to="/authority" color="inherit" sx={{ color: "text.secondary" }}>
                    Revisión
                  </Button>
                )}
                {isAdmin && (
                  <Button component={RouterLink} to="/admin" color="inherit" sx={{ color: "text.secondary" }}>
                    Administración
                  </Button>
                )}
                <ShieldOutlined sx={{ color: "secondary.main", fontSize: 18, display: { xs: "none", sm: "block" } }} />
                <Button
                  color="inherit"
                  startIcon={<LogoutOutlined />}
                  onClick={handleLogout}
                  sx={{ color: "text.secondary" }}
                >
                  Cerrar sesión
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
