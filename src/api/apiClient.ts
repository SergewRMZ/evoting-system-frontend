import axios from "axios";
import keycloak from "../auth/keycloakConfig";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Configuración en axios para agregar el token del proveedor de identidad
 * de tal manera que toas las solicitudes HTTP realizadas a través de la aplicación
 * sean autenticadas.
 */
apiClient.interceptors.request.use(async (config) => {
  if(keycloak.authenticated) {
    await keycloak.updateToken(30);

    if(keycloak.token) {
      console.log("Token added to header")
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
  }

  return config;
});