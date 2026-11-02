import { useState } from "react";
import { LogoutOutlined, ManageAccountsOutlined } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Container,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, matchPath, useLocation } from "react-router-dom";
import { useKeycloak } from "../auth/useKeycloak";
import { getHomePath } from "../auth/roles";
import keycloak from "../auth/keycloakConfig";
import Brand from "./layout/Brand";
import ColorModeButton from "./layout/ColorModeButton";

type NavItem = { label: string; to: string; /** Rutas que marcan el enlace como activo. */ match: string[] };

function getNavItems(roles: string[]): NavItem[] {
  if (roles.includes("ROLE_ADMIN")) {
    return [
      { label: "Elecciones", to: "/admin", match: ["/admin", "/admin/elections/*"] },
      { label: "Votantes", to: "/admin/voters", match: ["/admin/voters"] },
    ];
  }
  if (roles.includes("ROLE_AUTHORITY")) {
    return [{ label: "Revisión electoral", to: "/authority", match: ["/authority"] }];
  }
  if (roles.includes("ROLE_VOTER")) {
    return [{ label: "Elecciones", to: "/vote", match: ["/vote"] }];
  }
  return [];
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

function Navbar() {
  const { handleLogout, authenticated, roles, profile } = useKeycloak();
  const { pathname } = useLocation();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const navItems = getNavItems(roles);
  const isActive = (item: NavItem) => item.match.some((pattern) => matchPath(pattern, pathname));

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 3, minHeight: { xs: 60 } }}>
          <Brand to={authenticated ? getHomePath(roles) : "/"} />

          {navItems.length > 0 && (
            <Stack component="nav" direction="row" spacing={0.5} sx={{ display: { xs: "none", sm: "flex" } }} aria-label="Navegación principal">
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <Button
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    size="small"
                    aria-current={active ? "page" : undefined}
                    sx={(theme) => ({
                      color: active ? "text.primary" : "text.secondary",
                      bgcolor: active ? alpha(theme.palette.text.primary, 0.06) : "transparent",
                      "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.06) },
                    })}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          )}

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <ColorModeButton />
            {authenticated && (
              <ButtonBase
                onClick={(event) => setMenuAnchor(event.currentTarget)}
                aria-label="Abrir menú de la cuenta"
                aria-haspopup="menu"
                sx={{ borderRadius: "50%" }}
              >
                <Avatar sx={(theme) => ({ width: 32, height: 32, fontSize: "0.8125rem", fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.14), color: "primary.main" })}>
                  {initialsOf(profile?.name ?? "")}
                </Avatar>
              </ButtonBase>
            )}
          </Stack>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { variant: "outlined", sx: { mt: 1, minWidth: 240 } } }}
          >
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography variant="subtitle2" noWrap>{profile?.name}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{profile?.email || profile?.username}</Typography>
            </Box>
            {navItems.length > 0 && <Divider sx={{ display: { sm: "none" } }} />}
            {navItems.map((item) => (
              <MenuItem
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={isActive(item)}
                onClick={() => setMenuAnchor(null)}
                sx={{ display: { sm: "none" } }}
              >
                {item.label}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={() => { setMenuAnchor(null); void keycloak.accountManagement(); }}>
              <ListItemIcon><ManageAccountsOutlined fontSize="small" /></ListItemIcon>
              Mi perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutOutlined fontSize="small" /></ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
