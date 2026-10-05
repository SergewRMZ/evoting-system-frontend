import { useEffect, useState } from "react";
import electionServiceApi from "../services/election-service/election.api";
import tallyServiceApi from "../services/tally-service/tally-service.api";
import type { ElectionDetails } from "../services/election-service/election.types";
import type { EncryptionPublicKey } from "../services/tally-service/tally-service.types";
import type { AuthorizationPublicKey } from "../services/authorization-service/authorization.types";
import authorizationServiceApi from "../services/authorization-service/authorization.api";

const useVotingData = (electionId: string | undefined) => {
    const [election, setElection] = useState<ElectionDetails | null>(null);
    const [encryptionPublicKey, setEncryptionPublicKey] = useState<EncryptionPublicKey | null>(null);
    const [authorizationPublicKey, setAuthorizationPublicKey] = useState<AuthorizationPublicKey | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadVotingData = async () => {
            if(!electionId) {
                setError(new Error("No se ha proporcionado un Election ID"));
                setLoading(false);
                return ;
            }

            try {
                setError(null);
                setLoading(true);

                const[election, encryptionPublicKey, authorizationPublicKey] = await Promise.all([
                    electionServiceApi.getElectionDetailsById(electionId),
                    tallyServiceApi.getPublicKey(electionId),
                    authorizationServiceApi.getPublicKey(electionId)
                ]);

                setElection(election);
                setEncryptionPublicKey(encryptionPublicKey);
                setAuthorizationPublicKey(authorizationPublicKey);
            }   catch (error) {
                if(error instanceof Error) {
                    setError(error);
                }
            }   finally {
                setLoading(false);
            }
        };

        loadVotingData();
    }, [electionId]);

    return {
        election, 
        encryptionPublicKey, 
        authorizationPublicKey,
        loading, 
        error
    }
};

export default useVotingData;