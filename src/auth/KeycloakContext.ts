import { createContext } from "react";

interface KeycloakContextType {
  loading: boolean;
  handleLogout: () => void;
  handleLogin: () => void;
};

export const KeycloakContext = createContext<KeycloakContextType | null>(null);