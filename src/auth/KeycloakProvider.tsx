import Keycloak from "keycloak-js";
import { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import keycloak from "./keycloakConfig";

interface KeycloakProviderProps {
  children: ReactNode;
};

interface KeycloakContextType {
  keycloak: Keycloak | null;
  loading: boolean;
  handleLogout: () => void
};

const KeycloakContext = createContext<KeycloakContextType | null>(null);

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  useEffect(() => {

    if(initialized.current) return;

    initialized.current = true;
    const initKeycloak = async () => {
      try {
        await keycloak.init({
          onLoad: "check-sso",
          pkceMethod: "S256", // SHA-256
          silentCheckSsoRedirectUri: `${location.origin}/silent-check-sso.html`,
          checkLoginIframe: false
        });

        if(keycloak.authenticated) {
          console.log(keycloak);
        }
      } catch (error) {
        console.error(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    initKeycloak();
  },[])

  const handleLogout = () => {
    if(keycloak) {
      keycloak.logout();
    }
  };

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        loading,
        handleLogout
      }}
    >
      { children }
    </KeycloakContext.Provider>
  );
}
