import type { ReactNode } from "react";
import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Container, Stack, Typography, type ContainerProps } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Navbar from "../Navbar";

type PageLayoutProps = {
  children: ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
};

/** Estructura común de las páginas autenticadas: barra superior y contenido centrado. */
export function PageLayout({ children, maxWidth = "lg" }: PageLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container component="main" maxWidth={maxWidth} sx={{ py: { xs: 4, md: 6 } }}>
        {children}
      </Container>
    </Box>
  );
}

type PageHeaderProps = {
  title: ReactNode;
  /** Texto pequeño sobre el título (sección o contexto). */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Acciones alineadas a la derecha del título. */
  actions?: ReactNode;
  back?: { to: string; label: string };
};

/** Encabezado de página con jerarquía consistente: contexto, título, descripción y acciones. */
export function PageHeader({ title, eyebrow, description, actions, back }: PageHeaderProps) {
  return (
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
      {back && (
        <Button
          component={RouterLink}
          to={back.to}
          size="small"
          startIcon={<ArrowBack fontSize="small" />}
          sx={{ color: "text.secondary", ml: -1, mb: 2 }}
        >
          {back.label}
        </Button>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
      >
        <Box sx={{ minWidth: 0 }}>
          {eyebrow && (
            <Typography variant="overline" color="text.secondary" component="div">
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: "1.625rem", md: "2rem" } }}>
            {title}
          </Typography>
          {description && (
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
              {description}
            </Typography>
          )}
        </Box>
        {actions && <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>{actions}</Stack>}
      </Stack>
    </Box>
  );
}
