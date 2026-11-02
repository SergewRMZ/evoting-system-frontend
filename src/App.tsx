import AppRouter from "./routes/AppRouter";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { KeycloakProvider } from "./auth/KeycloakProvider";
import theme from "./theme";
import { useMemo, useState } from "react";
import type { ColorMode } from "./theme/ColorModeContext";
import { ColorModeContext } from "./theme/ColorModeContext";
import { GlobalErrorProvider } from "./errors/GlobalErrorProvider";
import GlobalAlertBanner from "./components/GlobalAlertBanner";

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

/** Preferencia guardada; si no existe, la del sistema operativo. */
const initialColorMode = (): ColorMode => {
  try {
    const stored = localStorage.getItem("color-mode");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Almacenamiento no disponible (modo privado o bloqueado).
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function App() {
  const [mode, setMode] = useState<ColorMode>(initialColorMode);
  const colorMode = useMemo(() => ({
    mode,
    toggleColorMode: () => {
      setMode((current) => {
        const nextMode = current === "dark" ? "light" : "dark";
        try {
          localStorage.setItem("color-mode", nextMode);
        } catch {
          // Se mantiene solo durante la sesión.
        }
        return nextMode;
      });
    },
  }), [mode]);
  const appTheme = useMemo(() => theme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <GlobalErrorProvider>
          <GlobalAlertBanner />
          <KeycloakProvider>
            <AppRouter />
          </KeycloakProvider>
        </GlobalErrorProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App;
