/**
 * Mapeo centralizado de errores HTTP y códigos de negocio
 * hacia mensajes seguros para el usuario final.
 *
 * Basado en API-errors.md del proyecto.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type ApiErrorContext =
  | "auth"
  | "election"
  | "authorization"
  | "bulletin-board"
  | "tally"
  | "generic";

interface MappedError {
  message: string;
  requiresReauth?: boolean;
}

type HttpStatusMap = Partial<Record<number, string>>;

const contextMessages: Record<ApiErrorContext, HttpStatusMap> = {
  auth: {
    400: "Los datos ingresados no son válidos. Verifica el formulario e inténtalo de nuevo.",
    401: "Tu sesión ha expirado. Inicia sesión nuevamente para continuar.",
    403: "No tienes permiso para realizar esta acción.",
    409: "El nombre de usuario o correo electrónico ya está registrado.",
    500: "Ocurrió un error interno. Inténtalo más tarde.",
  },
  election: {
    400: "El identificador de la elección no es válido o los datos enviados son incorrectos.",
    401: "Tu sesión ha expirado. Inicia sesión nuevamente para continuar.",
    403: "No tienes permiso para acceder a esta elección.",
    404: "La elección solicitada no fue encontrada.",
    409: "La elección no puede pasar a ese estado en este momento (estado incompatible).",
    500: "Ocurrió un error interno al procesar la elección. Inténtalo más tarde.",
  },
  authorization: {
    400: "El mensaje enviado no es válido. Verifica los datos e inténtalo de nuevo.",
    401: "Tu sesión ha expirado. Inicia sesión nuevamente para continuar.",
    403: "No tienes permiso para solicitar la autorización del voto.",
    404: "No se encontró una llave activa para esta elección. Contacta al administrador.",
    409: "Ya solicitaste autorización de un voto para esta elección. No puedes volver a solicitarlo.",
    422: "La firma o el resumen del voto no son válidos. El voto no puede ser autorizado.",
    500: "Ocurrió un error criptográfico interno. Inténtalo más tarde.",
    503: "El servicio de autorización no está disponible en este momento. Inténtalo más tarde.",
  },
  "bulletin-board": {
    400: "El voto enviado contiene datos inválidos o mal formados.",
    409: "Ya existe un voto con esta firma para la elección. No se puede registrar dos veces.",
    422: "La firma del voto no pudo ser verificada. El voto no fue registrado.",
    500: "Ocurrió un error interno al registrar el voto. Inténtalo más tarde.",
  },
  tally: {
    400: "El identificador de la elección no es válido.",
    401: "Tu sesión ha expirado. Inicia sesión nuevamente para continuar.",
    403: "No tienes permiso para realizar el escrutinio o consultar los resultados.",
    404: "No se encontraron llaves de cifrado para esta elección.",
    409: "Los resultados no están disponibles todavía. La elección debe estar en estado FINISHED.",
    500: "Ocurrió un error interno al procesar el escrutinio. Inténtalo más tarde.",
  },
  generic: {
    400: "Los datos enviados no son válidos.",
    401: "Tu sesión ha expirado. Inicia sesión nuevamente para continuar.",
    403: "No tienes permiso para realizar esta acción.",
    404: "El recurso solicitado no fue encontrado.",
    409: "La operación no pudo completarse debido a un conflicto con el estado actual.",
    422: "La información enviada no pudo ser procesada. Verifica los datos.",
    500: "Ocurrió un error interno inesperado. Inténtalo más tarde.",
    503: "El servicio no está disponible temporalmente. Inténtalo más tarde.",
  },
};

/**
 * Extrae y mapea un error de Axios (o cualquier otro) a un mensaje seguro
 * para el usuario final.
 *
 * @param error   - Objeto de error capturado en un catch.
 * @param context - Contexto del microservicio para mensajes más específicos.
 * @param fallback - Mensaje de respaldo si no hay mapeo disponible.
 */
export function mapApiError(
  error: unknown,
  context: ApiErrorContext = "generic",
  fallback = "Ocurrió un error inesperado. Inténtalo más tarde."
): MappedError {
  const axiosError = error as {
    isAxiosError?: boolean;
    response?: { status?: number; data?: unknown };
    message?: string;
  };

  if (axiosError?.isAxiosError) {
    const status = axiosError.response?.status;
    const requiresReauth = status === 401;

    // Buscar mensaje en el contexto específico primero, luego en generic
    const contextMap = contextMessages[context];
    const genericMap = contextMessages.generic;

    const message =
      (status !== undefined && contextMap[status]) ||
      (status !== undefined && genericMap[status]) ||
      fallback;

    return { message, requiresReauth };
  }

  if (error instanceof Error && error.message === "Network Error") {
    return {
      message:
        "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
    };
  }

  return { message: fallback };
}

// Recibir el error, el contexto define de qué serivicio del backend se trata el error.
export function getApiErrorMessage(
  error: unknown,
  context: ApiErrorContext = "generic",
  fallback?: string
): string {
  return mapApiError(error, context, fallback).message;
}



/**
 * Devuelve el código HTTP de una respuesta de error de Axios, o undefined
 * cuando el error no proviene de una respuesta del servidor.
 */
export function getHttpStatus(error: unknown): number | undefined {
  const axiosError = error as { isAxiosError?: boolean; response?: { status?: number } };
  return axiosError?.isAxiosError ? axiosError.response?.status : undefined;
}

/**
 * Título (`title`) del ProblemDetail que devuelve el backend, si existe.
 */
export function getProblemTitle(error: unknown): string | undefined {
  const axiosError = error as { isAxiosError?: boolean; response?: { data?: { title?: unknown } } };
  const title = axiosError?.isAxiosError ? axiosError.response?.data?.title : undefined;
  return typeof title === "string" ? title : undefined;
}
