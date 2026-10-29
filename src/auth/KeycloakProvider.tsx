import {useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import keycloak from "./keycloakConfig";
import { KeycloakContext } from "./KeycloakContext";
import LoadingPage from "../components/LoadingPage";

interface KeycloakProviderProps {
  children: ReactNode;
};

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const initialized = useRef(false);


  useEffect(() => {
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

        setAuthenticated(authenticated);
        setRoles(authenticated ? keycloak.realmAccess?.roles ?? [] : []);
      } catch (error) {
        setAuthError("No se pudo conectar con el proveedor de identidad. Verifica la configuración de Keycloak.");
        console.error("No se pudo inicializar Keycloak.", error);
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
  const hasRole = (role: string) => roles.includes(role);

  return (
    <KeycloakContext.Provider
      value={{
        loading,
        authenticated,
        roles,
        authError,
        hasRole,
        handleLogout,
        handleLogin,
        getToken,
      }}
    >
      { loading? <LoadingPage/> : children }
    </KeycloakContext.Provider>
  );
}
