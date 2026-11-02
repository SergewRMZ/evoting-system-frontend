import { useCallback, useEffect, useState } from "react";
import votersApi from "../../services/authentication-service/voters.api";
import type {
  VoterRegistrationPage,
  VoterRegistrationQuery,
} from "../../services/authentication-service/voters.types";
import { getApiErrorMessage } from "../../errors/apiErrorMap";

type Result = { key: string; data: VoterRegistrationPage | null; error: string | null };

/**
 * Carga una página de registros de votantes. Solo se aplica la respuesta de la consulta
 * vigente (las anteriores se descartan al cambiar filtros o búsqueda), y mientras carga
 * se conservan los datos previos para evitar parpadeos.
 */
const useVoterRegistrations = ({ status, search, page, size }: VoterRegistrationQuery) => {
  const [result, setResult] = useState<Result | null>(null);
  const [version, setVersion] = useState(0);
  const requestKey = JSON.stringify([status, search, page, size, version]);

  useEffect(() => {
    let active = true;
    votersApi
      .getRegistrations({ status, search, page, size })
      .then((data) => {
        if (active) setResult({ key: requestKey, data, error: null });
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setResult((previous) => ({
          key: requestKey,
          data: previous?.data ?? null,
          error: getApiErrorMessage(loadError, "auth", "No se pudieron consultar los registros de votantes."),
        }));
      });
    return () => {
      active = false;
    };
  }, [status, search, page, size, requestKey]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return {
    data: result?.data ?? null,
    loading: result?.key !== requestKey,
    error: result?.key === requestKey ? result.error : null,
    reload,
  };
};

export default useVoterRegistrations;
