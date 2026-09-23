import AppRouter from "./routes/AppRouter";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { KeycloakProvider } from "./auth/KeycloakProvider";
import theme from "./theme";

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';

function App() {
  return (
    <KeycloakProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
    </KeycloakProvider>
    
  )
}

export default App;