import { apiClient } from "../../api/apiClient"
import type { AuthorizationPublicKey, BlindSignature } from "./authorization.types";

const authorizationServiceApi = {
    getPublicKey: async (electionId: string): Promise<AuthorizationPublicKey> => {
        const response = await apiClient.get(`/api/authorization-service/elections/${electionId}/keys/public`);
        return response.data;
    },

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