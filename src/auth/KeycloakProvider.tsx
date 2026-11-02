import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import keycloak from "./keycloakConfig";
import { KeycloakContext, type UserProfile } from "./KeycloakContext";
import LoadingPage from "../components/LoadingPage";

interface KeycloakProviderProps {
  children: ReactNode;
};

const readProfile = (): UserProfile | null => {
  const token = keycloak.tokenParsed as
    | { name?: string; preferred_username?: string; email?: string }
    | undefined;
  if (!token) return null;
  const username = token.preferred_username ?? "";
  return { name: token.name || username, username, email: token.email ?? "" };
};

/** Tras iniciar sesión o registrarse, `/start` envía a cada usuario a su página según su rol. */
const startUri = () => `${window.location.origin}/start`;

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
        setProfile(authenticated ? readProfile() : null);
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
      await keycloak.login({ redirectUri: startUri() });
    }
  }

  const handleRegister = async () => {
    if(keycloak) {
      // El scope "matricula" activa ese campo en el formulario: solo el registro de votantes lo solicita,
      // así que no se pide a cuentas de administración ni de autoridad al iniciar sesión.
      await keycloak.register({ redirectUri: startUri(), scope: "openid matricula" });
    }
  }

  const refreshRoles = async () => {
    // -1 fuerza la renovación aunque el token siga vigente.
    await keycloak.updateToken(-1);
    const current = keycloak.realmAccess?.roles ?? [];
    setRoles(current);
    setProfile(readProfile());
    return current;
  };

  const getToken = () => keycloak.token ?? null;
  const hasRole = (role: string) => roles.includes(role);

  return (
    <KeycloakContext.Provider
      value={{
        loading,
        authenticated,
        roles,
        profile,
        authError,
        hasRole,
        handleLogout,
        handleLogin,
        handleRegister,
        refreshRoles,
        getToken,
      }}
    >
      { loading? <LoadingPage/> : children }
    </KeycloakContext.Provider>
  );
}
