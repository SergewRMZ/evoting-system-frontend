import { createContext } from "react";

interface KeycloakContextType {
  loading: boolean;
  authenticated: boolean;
  roles: string[];
  authError: string | null;
  hasRole: (role: string) => boolean;
  handleLogout: () => void;
  handleLogin: () => void;
  getToken: () => string | null;
};

export const KeycloakContext = createContext<KeycloakContextType | null>(null);