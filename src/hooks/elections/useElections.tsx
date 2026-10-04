import { useEffect, useState } from "react";
import type { Election } from "../../features/elections/electionTypes";
import { electionApi } from "../../features/elections/election.api";

const useElections = () => {
    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const loadElections = async () => {
            try {
                const data = await electionApi.getElections();
                setElections(data);
            }   catch (error) {
                console.log(error);
                setError(true);
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