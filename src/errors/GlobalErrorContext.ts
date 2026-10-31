import { createContext, useContext } from "react";
import type { AlertColor } from "@mui/material";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface GlobalAlert {
  id: string;
  message: string;
  severity: AlertColor;
}

export interface GlobalErrorContextType {
  alerts: GlobalAlert[];
  pushAlert: (message: string, severity?: AlertColor) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
}

// ---------------------------------------------------------------------------
// Contexto
// ---------------------------------------------------------------------------

export const GlobalErrorContext =
  createContext<GlobalErrorContextType | null>(null);

export function useGlobalError(): GlobalErrorContextType {
  const ctx = useContext(GlobalErrorContext);
  if (!ctx) {
    throw new Error(
      "useGlobalError debe usarse dentro de <GlobalErrorProvider>"
    );
  }
  return ctx;
}

