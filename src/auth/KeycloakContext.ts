import { createContext } from "react";

interface KeycloakContextType {
  loading: boolean;
  authenticated: boolean;
  handleLogout: () => void;
  handleLogin: () => void;
  getToken: () => string | null;
};

export const KeycloakContext = createContext<KeycloakContextType | null>(null);