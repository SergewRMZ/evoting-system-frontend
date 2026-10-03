import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9b8afb",
      contrastText: "#111014",
    },
    secondary: {
      main: "#72e6b1",
    },
    background: {
      default: "#09090b",
      paper: "#121216",
    },
    text: {
      primary: "#f4f3f8",
      secondary: "#a09eaa",
    },
    success: {
      main: "#72e6b1",
    },
    error: {
      main: "#ff777f",
    },
    divider: "rgba(255,255,255,.1)",
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