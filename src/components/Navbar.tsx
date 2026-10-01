import { HowToVoteOutlined, LogoutOutlined } from "@mui/icons-material";
import { AppBar, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { useKeycloak } from "../auth/useKeycloak";

function Navbar() {
  const { handleLogout } = useKeycloak();

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: "#101828" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <HowToVoteOutlined sx={{ color: "#6ce9a6" }} />
            <Typography sx={{ fontWeight: 700 }}>VotoClaro</Typography>
          </Stack>
          <Button
            color="inherit"
            startIcon={<LogoutOutlined />}
            onClick={handleLogout}
            sx={{ color: "#d0d5dd" }}
          >
            Cerrar sesión
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
