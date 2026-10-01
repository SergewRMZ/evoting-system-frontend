import { isElection } from "./electionValidation";
import type { Election } from "./electionTypes";

const ELECTIONS_API_PATH = "/api/election-service/elections";

export type ElectionApiErrorKind =
  | "network"
  | "http"
  | "invalid-json"
  | "invalid-response";

export class ElectionApiError extends Error {
  readonly kind: ElectionApiErrorKind;
  readonly statusCode?: number;

  constructor(
    kind: ElectionApiErrorKind,
    message: string,
    statusCode?: number,
  ) {
    super(message);
    this.name = "ElectionApiError";
    this.kind = kind;
    this.statusCode = statusCode;
  }
}

export async function getElectionById(
  electionId: string,
  signal?: AbortSignal,
): Promise<Election> {
  let response: Response;

  try {
    response = await fetch(
      `${ELECTIONS_API_PATH}/${encodeURIComponent(electionId)}`,
      {
        headers: { Accept: "application/json" },
        signal,
      },
    );
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    throw new ElectionApiError(
      "network",
      "No fue posible conectar con el servicio de elecciones.",
    );
  }

  if (!response.ok) {
    throw new ElectionApiError(
      "http",
      `El servicio de elecciones respondió con HTTP ${response.status}.`,
      response.status,
    );
  }

  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    throw new ElectionApiError(
      "invalid-json",
      "El servicio devolvió una respuesta que no es JSON válido.",
    );
  }

  if (!isElection(responseBody)) {
    throw new ElectionApiError(
      "invalid-response",
      "La respuesta del servicio no tiene el formato esperado para una elección.",
    );
  }

  return responseBody;
}
