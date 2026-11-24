import { useState } from "react"
import authorizationServiceApi from "../../services/authorization-service/authorization.api";
import type { EncryptionPublicKey } from "../../services/tally-service/tally-service.types";
import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";
import { createBlindedVoteMessage, unblindVote } from "../../utils/voting/vote.utils";
import type { ElectionDetails } from "../../services/election-service/election.types";
import { Uint8ArrayToBase64 } from "../../crypto/crypto.utils";
import type { AuthorizedVote } from "../../types/vote.types";
import { getApiErrorMessage, getProblemTitle } from "../../errors/apiErrorMap";

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
    ): Promise<AuthorizedVote> => {
    
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
                signedVote: {
                    encryptedVote,
                    randomizer: randomizer,
                    digest: Uint8ArrayToBase64(digest),
                    signature
                },
                blindSignature: data.blindSignature,
            };
        }   catch(error) {
            // El servicio de autorización también responde 409 cuando la votación ya terminó:
            // no debe confundirse con "ya solicitaste tu autorización".
            if (getProblemTitle(error) === "Election Not Active") {
                throw new Error(
                    "La votación de esta elección ya no está activa. No es posible autorizar tu voto.",
                    { cause: error }
                );
            }
            throw new Error(
                getApiErrorMessage(error, "authorization", "No se pudo autorizar el voto."),
                { cause: error }
            );
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
