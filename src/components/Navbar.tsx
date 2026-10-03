import { HowToVoteOutlined, LogoutOutlined, ShieldOutlined } from "@mui/icons-material";
import { AppBar, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { useKeycloak } from "../auth/useKeycloak";

function Navbar() {
  const { handleLogout } = useKeycloak();

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: "#09090b", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <HowToVoteOutlined sx={{ color: "secondary.main" }} />
            <Typography sx={{ fontWeight: 700, letterSpacing: "-.03em" }}>VotoClaro</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mr: { xs: 1, sm: 3 }, display: { xs: "none", sm: "flex" } }}>
            <ShieldOutlined sx={{ color: "secondary.main", fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Votación anónima</Typography>
          </Stack>
          <Button
            color="inherit"
            startIcon={<LogoutOutlined />}
            onClick={handleLogout}
            sx={{ color: "text.secondary" }}
          >
            Cerrar sesión
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
