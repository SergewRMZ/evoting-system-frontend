import { useEffect, useState } from "react";
import { type ElectionDetails } from "../../features/elections/electionTypes";
import { electionApi } from "../../features/elections/election.api";

const useElectionDetails = (electionId: string | undefined) => {
    const [election, setElection] = useState<ElectionDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadElection = async () => {
            if (!electionId) {
                setLoading(false);
                setError(new Error("No se ha proporcionado un Election ID"));
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await electionApi.getElectionDetailsById(electionId);
                setElection(data);
            } catch (error) {
                if(error instanceof Error) {
                    console.error(error);
                    setError(error);
                }
            } finally {
                setLoading(false);
            }
        }

        loadElection();
    }, [electionId]);

    return {
        election,
        loading,
        error
    };
};

export default useElectionDetails;