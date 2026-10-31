import { useCallback, useEffect, useState } from "react";
import tallyServiceApi from "../../services/tally-service/tally-service.api";
import type { ElectionTallyResult } from "../../services/tally-service/tally-service.types";
import { mapApiError } from "../../errors/apiErrorMap";

interface UseElectionResultsReturn {
  results: ElectionTallyResult[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useElectionResults(
  electionId: string | undefined
): UseElectionResultsReturn {
  const [results, setResults] = useState<ElectionTallyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!electionId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await tallyServiceApi.getResults(electionId);
      setResults(data);
    } catch (err) {
      setError(mapApiError(err, "tally").message);
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    if (!electionId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await tallyServiceApi.getResults(electionId);
        setResults(data);
      } catch (err) {
        setError(mapApiError(err, "tally").message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [electionId]);

  return { results, loading, error, refetch };
}

export default useElectionResults;