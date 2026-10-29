import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === "object") {
      const details = data as Record<string, unknown>;
      if (typeof details.detail === "string") return details.detail;
      if (typeof details.message === "string") return details.message;
      if (typeof details.title === "string") return details.title;
    }

    if (error.response?.status === 403) {
      return "No tienes permisos para realizar esta acción.";
    }
    if (error.response?.status === 401) {
      return "Tu sesión expiró. Inicia sesión nuevamente.";
    }
  }

  return error instanceof Error ? error.message : fallback;
}
