import { apiClient } from "../../api/apiClient"
import type { AuthorizationPublicKey, BlindSignature } from "./authorization.types";

const authorizationServiceApi = {
    getPublicKey: async (electionId: string): Promise<AuthorizationPublicKey> => {
        const response = await apiClient.get(`/api/authorization-service/elections/${electionId}/keys/public`);
        return response.data;
    },

    /**
     * 
     * @param electionId Identificador de la elección
     * @param blindedMessage Mensaje cegado en formato Base64.
     * @returns Promise<BlindSignature> Una promesa que resuelve con el contenido
     * de una firma digital ciega. 
     */
    requestBlindSignature: async(
        electionId: string, 
        blindedMessage: string
    ): Promise<BlindSignature> => {
        const response = await apiClient.post(`/api/authorization-service/elections/${electionId}/blind-signature`,
            { blindedMessage }
        );
        return response.data;
    }    
}

export default authorizationServiceApi;