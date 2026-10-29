import { useEffect, useState } from "react";
import type { Election } from "../../services/election-service/election.types";
import electionServiceApi from "../../services/election-service/election.api";
import { getApiErrorMessage } from "../../utils/apiError";

const useElections = () => {
    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadElections = async () => {
            try {
                setError(null);
                const data = await electionServiceApi.getElections();
                setElections(data);
            }   catch (error) {
                setError(new Error(getApiErrorMessage(error, "No se pudieron cargar las elecciones."), { cause: error }));
            } finally {
                setLoading(false);
            }
        }

        loadElections();
    }, []);

    return {
        elections,
        loading,
        error
    }
}

export default useElections;