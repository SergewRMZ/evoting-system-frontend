import { createContext } from "react";

export type UserProfile = {
  name: string;
  username: string;
  email: string;
};

interface KeycloakContextType {
  loading: boolean;
  authenticated: boolean;
  roles: string[];
  profile: UserProfile | null;
  authError: string | null;
  hasRole: (role: string) => boolean;
  handleLogout: () => void;
  handleLogin: () => void;
  /** Abre el formulario de registro de Keycloak. */
  handleRegister: () => void;
  /** Renueva el token para leer los roles actuales (p. ej. tras una aprobación). */
  refreshRoles: () => Promise<string[]>;
  getToken: () => string | null;
};

export const KeycloakContext = createContext<KeycloakContextType | null>(null);
