import { useState } from "react"
import authorizationServiceApi from "../../services/authorization-service/authorization.api";
import axios from "axios";
import type { EncryptionPublicKey } from "../../services/tally-service/tally-service.types";
import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";
import { createBlindedVoteMessage, unblindVote } from "../../utils/voting/vote.utils";
import type { ElectionDetails } from "../../services/election-service/election.types";
import { Uint8ArrayToBase64 } from "../../crypto/crypto.utils";
import type { SignedVote } from "../../types/vote.types";

const useAuthorization = () => {
    const[loading, setLoading] = useState(false);

    /**
     * Cifra las opciones para cada boleta y genera el mensaje cegado a partir
     * del valor hash del contenido del voto una vez que se tienen las opciones cifradas.
     * @remarks 
     * El mensaje cegado es generado a partir del esquema criptográfico de firma ciega. 
     * El randomizer es una cadena de 384 bits que permite generar aleatoriedad al mensaje
     * de entrada. 
     */
    const authorizeVote = async (
        election: ElectionDetails, 
        selectedCandidacies: Record<string, string>,
        encryptionPublicKey: EncryptionPublicKey,
        authorizationPublicKey: AuthorizationPublicKey
    ): Promise<SignedVote> => {
    
        try {
            setLoading(true);

            const { encryptedVote, digest, blindResult } = 
                await createBlindedVoteMessage(
                    election,
                    selectedCandidacies,
                    encryptionPublicKey,
                    authorizationPublicKey,
                );

            const randomizer = Uint8ArrayToBase64(blindResult.randomizer!);
            console.log("Factor de desenmascaramiento: ", Uint8ArrayToBase64(blindResult.inv_blind_factor));
            console.log("Mensaje cegado:", Uint8ArrayToBase64(blindResult.blinded_message));

            const data = await authorizationServiceApi.requestBlindSignature(
                election.electionId, 
                Uint8ArrayToBase64(blindResult.blinded_message)
            );

            const signature = await unblindVote(
                data.blindSignature,
                blindResult,
                digest,
                authorizationPublicKey
            );

            return {
                encryptedVote,
                randomizer: randomizer,
                digest: Uint8ArrayToBase64(digest),
                signature
            };
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
        authorizeVote,
    }
}

export default useAuthorization;