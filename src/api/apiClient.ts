import axios from "axios";
import keycloak from "../auth/keycloakConfig";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Interceptor de REQUEST ────────────────────────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30);

    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
  }

  return config;
});

// ── Interceptor de RESPONSE ───────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as {
      isAxiosError?: boolean;
      response?: { status?: number };
    };

    if (axiosError?.isAxiosError && axiosError.response?.status === 401) {
      if (!keycloak.authenticated) {
        void keycloak.login({
          redirectUri: `${window.location.origin}${window.location.pathname}`,
        });
      }
    }

    return Promise.reject(error);
  }
);
