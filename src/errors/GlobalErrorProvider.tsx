import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { AlertColor } from "@mui/material";
import { GlobalErrorContext } from "./GlobalErrorContext";
import type { GlobalAlert } from "./GlobalErrorContext";

interface GlobalErrorProviderProps {
  children: ReactNode;
}

let _counter = 0;
const nextId = () => `alert-${++_counter}`;

/**
 * Proveedor global de alertas/errores.
 * Envuelve la aplicación (dentro de <App>) y expone `pushAlert` para
 * que cualquier hook o componente pueda emitir una notificación.
 */
export function GlobalErrorProvider({ children }: GlobalErrorProviderProps) {
  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);

  const pushAlert = useCallback(
    (message: string, severity: AlertColor = "error") => {
      const id = nextId();
      setAlerts((prev) => [...prev, { id, message, severity }]);
    },
    []
  );

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return (
    <GlobalErrorContext.Provider
      value={{ alerts, pushAlert, dismissAlert, clearAlerts }}
    >
      {children}
    </GlobalErrorContext.Provider>
  );
}

