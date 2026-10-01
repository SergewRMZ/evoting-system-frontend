import { useEffect, useState } from "react";
import { ElectionApiError, getElectionById } from "./electionService";
import type { Election } from "./electionTypes";

export type ElectionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; election: Election };

function getErrorMessage(error: unknown) {
  if (error instanceof ElectionApiError) {
    if (error.kind === "network") {
      return `${error.message} Verifica que esté disponible e inténtalo de nuevo.`;
    }
    if (error.kind === "http") {
      return `${error.message} Inténtalo de nuevo.`;
    }
    return error.message;
  }

  return "Ocurrió un error inesperado al cargar la elección.";
}

export function useElection(electionId: string) {
  const [state, setState] = useState<ElectionState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadElection() {
      setState({ status: "loading" });

      try {
        const election = await getElectionById(
          electionId,
          controller.signal,
        );
        setState({ status: "success", election });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setState({ status: "error", message: getErrorMessage(error) });
      }
    }

    void loadElection();
    return () => controller.abort();
  }, [electionId, retryCount]);

  return {
    state,
    retry: () => setRetryCount((count) => count + 1),
  };
}
