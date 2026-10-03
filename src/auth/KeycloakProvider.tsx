import {useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import keycloak from "./keycloakConfig";
import { KeycloakContext } from "./KeycloakContext";


interface KeycloakProviderProps {
  children: ReactNode;
};

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

  const handleLogin = async () => {
    console.log("Ejecutando login");
    if(keycloak) {
      await keycloak.login({ redirectUri: `${window.location.origin}/vote` });
    }
  }

  const getToken = () => keycloak.token ?? null;

  return (
    <KeycloakContext.Provider
      value={{
        loading,
        handleLogout,
        handleLogin,
        getToken
      }}
    >
      { children }
    </KeycloakContext.Provider>
  );
}
