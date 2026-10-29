import AppRouter from "./routes/AppRouter";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { KeycloakProvider } from "./auth/KeycloakProvider";
import theme from "./theme";
import { useMemo, useState } from "react";
import type { ColorMode } from "./theme/ColorModeContext";
import { ColorModeContext } from "./theme/ColorModeContext";

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';

function App() {
  const [mode, setMode] = useState<ColorMode>(() =>
    localStorage.getItem("color-mode") === "light" ? "light" : "dark",
  );
  const colorMode = useMemo(() => ({
    mode,
    toggleColorMode: () => {
      setMode((current) => {
        const nextMode = current === "dark" ? "light" : "dark";
        localStorage.setItem("color-mode", nextMode);
        return nextMode;
      });
    },
  }), [mode]);
  const appTheme = useMemo(() => theme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <KeycloakProvider>
          <AppRouter />
        </KeycloakProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App;