import { useCallback, useEffect, useState } from "react";
import { type ElectionDetails } from "../../services/election-service/election.types";
import electionServiceApi from "../../services/election-service/election.api";
import { getApiErrorMessage } from "../../errors/apiErrorMap";

const useElectionDetails = (electionId: string | undefined) => {
    const [election, setElection] = useState<ElectionDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [loadedElectionId, setLoadedElectionId] = useState<string | undefined>();

    const loadElection = useCallback(async () => {
        if (!electionId) {
            throw new Error("No se ha proporcionado un Election ID");
        }
        setLoading(true);
        setError(null);
        try {
            const data = await electionServiceApi.getElectionDetailsById(electionId);
            setElection(data);
            setLoadedElectionId(electionId);
        } catch (loadError) {
            setError(new Error(getApiErrorMessage(loadError, "election"), { cause: loadError }));
            throw loadError;
        } finally {
            setLoading(false);
        }
    }, [electionId]);

    useEffect(() => {
        if (!electionId) return;
        let active = true;
        electionServiceApi.getElectionDetailsById(electionId)
            .then((data) => {
                if (!active) return;
                setElection(data);
                setLoadedElectionId(electionId);
                setError(null);
            })
            .catch((loadError: unknown) => {
                if (active) {
                    setError(new Error(getApiErrorMessage(loadError, "election"), { cause: loadError }));
                    setLoadedElectionId(electionId);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [electionId]);

    return {
        election,
        loading: Boolean(electionId) && (loading || loadedElectionId !== electionId),
        error: error ?? (!electionId ? new Error("No se ha proporcionado un Election ID") : null),
        reload: loadElection,
    };
};

export default useElectionDetails;