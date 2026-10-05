import { useState } from "react"
import authorizationServiceApi from "../../services/authorization-service/authorization.api";
import axios from "axios";
import type { EncryptionPublicKey } from "../../services/tally-service/tally-service.types";
import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";
import { createBlindedVoteMessage, unblindVote } from "../../utils/voting/vote.utils";
import type { ElectionDetails } from "../../services/election-service/election.types";
import { arrayUint8ArrayToBase64 } from "../../crypto/crypto.utils";
import type { EncryptedVotePayload } from "../../types/vote.types";

const useAuthorization = () => {
    const[loading, setLoading] = useState(false);
    const[encryptedVote, setEncryptedVote] = useState<EncryptedVotePayload | null>(null);
    const[signature, setSignature] = useState<string | null>(null);

    const authorizeVote = async (
        election: ElectionDetails, 
        selectedCandidacies: Record<string, string>,
        encryptionPublicKey: EncryptionPublicKey,
        authorizationPublicKey: AuthorizationPublicKey
    ) => {
    
        try {
            setLoading(true);

            // Cifrado y enmascaramiento del voto
            const { encryptedVote, digest, blindedVote } = await createBlindedVoteMessage(
                election,
                selectedCandidacies,
                encryptionPublicKey,
                authorizationPublicKey,
            );

            console.log("Voto cifrado: ", encryptedVote);
            console.log("Digesto del voto: ", digest);
            console.log("Voto cegado: ", blindedVote);
            setEncryptedVote(encryptedVote);
            const blindedMessage = arrayUint8ArrayToBase64(blindedVote.blinded_message);

            // Solicitar firma digital ciega
            const data = await authorizationServiceApi.requestBlindSignature(
                election.electionId, 
                blindedMessage
            );

            const signatureBytes = await unblindVote(
                data.blindSignature,
                blindedVote,
                digest,
                authorizationPublicKey
            );

            const signatureBase64 = arrayUint8ArrayToBase64(signatureBytes);
            setSignature(signatureBase64);
            return signatureBase64;
        }   catch(error) {
            if(axios.isAxiosError(error)) {
                const problemDetails = error.response?.data;
                if (problemDetails?.detail) {
                    throw new Error(problemDetails.detail, {cause: error});
                }
            }

            throw error;
        }   
        
        finally {
            setLoading(false);
        }
    };

    return {
        loading,
        encryptedVote,
        signature,
        authorizeVote,
    }
}

export default useAuthorization;