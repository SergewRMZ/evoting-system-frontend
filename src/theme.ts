import { alpha, createTheme, type Theme } from "@mui/material/styles";
import type { ColorMode } from "./theme/ColorModeContext";

type PaletteColorKey = "primary" | "secondary" | "success" | "warning" | "info" | "error";
const PALETTE_KEYS: PaletteColorKey[] = ["primary", "secondary", "success", "warning", "info", "error"];

/**
 * Sistema visual: superficies neutras, un único color de acento (azul institucional)
 * y colores de estado reservados para comunicar significado.
 */
const tokens = (mode: ColorMode) =>
  mode === "dark"
    ? {
        primary: "#7EA2FF",
        secondary: "#9AA4B5",
        success: "#4ADE80",
        warning: "#FBBF24",
        info: "#60A5FA",
        error: "#F87171",
        background: "#0B0D12",
        paper: "#12151C",
        text: "#E7E9EF",
        textSecondary: "#9AA3B2",
        divider: "rgba(255,255,255,0.08)",
      }
    : {
        primary: "#1E47C8",
        secondary: "#4B5567",
        success: "#15803D",
        warning: "#B45309",
        info: "#0B6BB8",
        error: "#B42318",
        background: "#F6F7F9",
        paper: "#FFFFFF",
        text: "#101828",
        textSecondary: "#5B6475",
        divider: "rgba(16,24,40,0.09)",
      };

const theme = (mode: ColorMode) => {
  const t = tokens(mode);
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: t.primary, contrastText: isDark ? "#0B0D12" : "#FFFFFF" },
      secondary: { main: t.secondary },
      success: { main: t.success },
      warning: { main: t.warning },
      info: { main: t.info },
      error: { main: t.error },
      background: { default: t.background, paper: t.paper },
      text: { primary: t.text, secondary: t.textSecondary },
      divider: t.divider,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"].join(","),
      h1: { fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 },
      h2: { fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.12 },
      h3: { fontWeight: 600, letterSpacing: "-0.025em" },
      h4: { fontWeight: 600, letterSpacing: "-0.02em" },
      h5: { fontWeight: 600, letterSpacing: "-0.015em" },
      h6: { fontWeight: 600, letterSpacing: "-0.01em", fontSize: "1.0625rem" },
      subtitle2: { fontWeight: 600 },
      body2: { lineHeight: 1.6 },
      overline: { fontWeight: 600, letterSpacing: "0.1em", fontSize: "0.6875rem", lineHeight: 2 },
      button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: t.background },
          "::selection": { backgroundColor: alpha(t.primary, 0.2) },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, paddingInline: 14 },
          sizeLarge: { paddingBlock: 10, paddingInline: 20, fontSize: "0.9375rem" },
          outlined: ({ theme }: { theme: Theme }) => ({ borderColor: theme.palette.divider }),
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: "none" },
          outlined: ({ theme }: { theme: Theme }) => ({ borderColor: theme.palette.divider }),
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: "inherit" },
        styleOverrides: {
          root: {
            backgroundColor: alpha(t.paper, 0.85),
            backdropFilter: "saturate(180%) blur(12px)",
            borderBottom: `1px solid ${t.divider}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme, ownerState }: { theme: Theme; ownerState: { color?: string; variant?: string } }) => {
            const base = { borderRadius: 6, fontWeight: 500 };
            const key = ownerState.color as PaletteColorKey | undefined;
            if (ownerState.variant === "outlined" || !key || !PALETTE_KEYS.includes(key)) return base;
            // Variante "suave": fondo tenue y texto del color, más sobria que el relleno sólido.
            const main = theme.palette[key].main;
            return { ...base, backgroundColor: alpha(main, isDark ? 0.16 : 0.1), color: main };
          },
          sizeSmall: { height: 22, fontSize: "0.75rem" },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }: { theme: Theme }) => ({
            borderRadius: 14,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark ? "0 24px 64px rgba(0,0,0,.6)" : "0 24px 64px rgba(16,24,40,.14)",
          }),
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 8, alignItems: "flex-start" } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({ borderColor: theme.palette.divider }),
          head: ({ theme }: { theme: Theme }) => ({
            fontWeight: 600,
            fontSize: "0.75rem",
            color: theme.palette.text.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }),
        },
      },
      MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, minHeight: 44 } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 6, fontSize: "0.75rem" } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4 } } },
    },
  });
};

export default theme;
