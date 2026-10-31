import { createTheme } from "@mui/material/styles";
import type { ColorMode } from "./theme/ColorModeContext";

const theme = (mode: ColorMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: "#1a9cff",
      contrastText: "#111014",
    },
    secondary: {
      main: "#45afff",
    },
    background: {
      default: mode === "dark" ? "#09090b" : "#f5f7fb",
      paper: mode === "dark" ? "#121216" : "#ffffff",
    },
    text: {
      primary: mode === "dark" ? "#f4f3f8" : "#171923",
      secondary: mode === "dark" ? "#a09eaa" : "#555b6e",
    },
    success: {
      main: mode === "dark" ? "#44ff7c" : "#168a45",
    },
    error: {
      main: mode === "dark" ? "#ff5c66" : "#c62828",
    },
    divider: mode === "dark" ? "rgba(255,255,255,.1)" : "rgba(25,35,60,.14)",
  },
  typography: {
    fontFamily: ["Inter", "Roboto", "sans-serif"].join(","),
    h1: { fontWeight: 700, letterSpacing: "-0.04em" },
    h2: { fontWeight: 700, letterSpacing: "-0.03em" },
    h3: { fontWeight: 700, letterSpacing: "-0.03em" },
    button: { fontWeight: 700, textTransform: "none" },
  },
  shape: { borderRadius: 16 },
});

export default theme;