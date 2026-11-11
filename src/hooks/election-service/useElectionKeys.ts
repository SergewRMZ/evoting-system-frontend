import { useCallback, useEffect, useState } from "react";
import authorizationServiceApi from "../../services/authorization-service/authorization.api";
import type { AuthorizationKeys } from "../../services/authorization-service/authorization.types";
import tallyServiceApi from "../../services/tally-service/tally-service.api";
import type { EncryptionKey } from "../../services/tally-service/tally-service.types";
import type { ElectionDetails } from "../../services/election-service/election.types";
import { getApiErrorMessage, getHttpStatus } from "../../errors/apiErrorMap";
import { electionHasKeys } from "../../utils/keyStatus";

export type KeyLookup<T> =
  | { state: "found"; key: T }
  | { state: "missing" }
  | { state: "error"; message: string };

type LoadedKeys = {
  source: ElectionDetails;
  attempt: number;
  authorization: KeyLookup<AuthorizationKeys>;
  encryption: KeyLookup<EncryptionKey>;
};

/** Un 404 no es un fallo: significa que esa clave todavía no se ha generado. */
const lookupKey = async <T,>(fetchKey: () => Promise<T>): Promise<KeyLookup<T>> => {
  try {
    return { state: "found", key: await fetchKey() };
  } catch (error) {
    if (getHttpStatus(error) === 404) return { state: "missing" };
    return { state: "error", message: getApiErrorMessage(error, "generic") };
  }
};

/**
 * Consulta las claves de la elección en ambos servicios. Se vuelven a leer cada vez
 * que cambia `election`, de modo que recargarla tras una operación las actualiza
 * aunque su estado siga siendo el mismo (p. ej. al completar claves pendientes).
 */
const useElectionKeys = (election: ElectionDetails) => {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<LoadedKeys | null>(null);
  const enabled = electionHasKeys(election.status);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void Promise.all([
      lookupKey(() => authorizationServiceApi.getKeys(election.electionId)),
      lookupKey(() => tallyServiceApi.getPublicKey(election.electionId)),
    ]).then(([authorization, encryption]) => {
      if (active) setLoaded({ source: election, attempt, authorization, encryption });
    });
    return () => {
      active = false;
    };
  }, [election, attempt, enabled]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);
  const current = loaded?.source === election && loaded.attempt === attempt ? loaded : null;

  return {
    enabled,
    authorization: current?.authorization ?? null,
    encryption: current?.encryption ?? null,
    reload,
  };
};

export default useElectionKeys;
