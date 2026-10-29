import { apiClient } from "../../api/apiClient"
import type { AuthorizationKeys, AuthorizationPublicKey, BlindSignature } from "./authorization.types";

const authorizationServiceApi = {
    getPublicKey: async (electionId: string): Promise<AuthorizationPublicKey> => {
        const response = await apiClient.get(`/api/authorization-service/elections/${encodeURIComponent(electionId)}/keys/public`);
        return response.data;
    },

    createKeys: async (electionId: string): Promise<AuthorizationKeys> => {
        const response = await apiClient.post(`/api/authorization-service/elections/${encodeURIComponent(electionId)}/keys`);
        return response.data;
    },

    activateKeys: async (electionId: string): Promise<AuthorizationKeys> => {
        const response = await apiClient.patch(`/api/authorization-service/elections/${encodeURIComponent(electionId)}/keys/activate`);
        return response.data;
    },

    /**
     * @param electionId Identificador de la elección
     * @param blindedMessage Mensaje cegado en formato Base64.
     * @returns Promise<BlindSignature> Una promesa que resuelve 
     * con el contenido de una firma digital ciega. 
     */
    requestBlindSignature: async(
        electionId: string, 
        blindedMessage: string
    ): Promise<BlindSignature> => {
        const response = await apiClient.post(`/api/authorization-service/elections/${encodeURIComponent(electionId)}/blind-signature`,
            { blindedMessage }
        );
        return response.data;
    }    
}

export default authorizationServiceApi;