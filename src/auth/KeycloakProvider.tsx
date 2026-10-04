import {useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import keycloak from "./keycloakConfig";
import { KeycloakContext } from "./KeycloakContext";

interface KeycloakProviderProps {
  children: ReactNode;
};

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const initialized = useRef(false);


  useEffect(() => {
    // Evita que se ejecute la inicialización de Keycloak más de una vez.
    if(initialized.current) return;

    initialized.current = true;
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: "check-sso",
          pkceMethod: "S256", // SHA-256
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
          checkLoginIframe: false
        });

        console.log("Keycloak has been initialized.");
        setAuthenticated(authenticated);
        console.log(keycloak);
      } catch (error) {
        console.error(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    initKeycloak();
  },[])

  const handleLogout = async () => {
    if(keycloak) {
      await keycloak.logout({
        redirectUri: `${window.location.origin}`
      });
    }
  };

  const handleLogin = async () => {
    if(keycloak) {
      await keycloak.login({ 
        redirectUri: `${window.location.origin}/vote` 
      });
    }
  }

  const getToken = () => keycloak.token ?? null;

  return (
    <KeycloakContext.Provider
      value={{
        loading,
        authenticated,
        handleLogout,
        handleLogin,
        getToken,
      }}
    >
      { children }
    </KeycloakContext.Provider>
  );
}
