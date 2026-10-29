import { apiClient  } from "../../api/apiClient";
import type { ElectionTallyResult, EncryptionKey, EncryptionPublicKey } from "./tally-service.types";
const tallyServiceApi = {
    getPublicKey: async (electionId: string): Promise<EncryptionPublicKey> => {
        const response = await apiClient.get(`/api/tally-service/elections/${encodeURIComponent(electionId)}/encryption-keys/public`);
        return response.data;
    },

    createKeys: async (electionId: string): Promise<EncryptionKey> => {
        const response = await apiClient.post(`/api/tally-service/elections/${encodeURIComponent(electionId)}/encryption-keys`);
        return response.data;
    },

    activateKeys: async (electionId: string): Promise<EncryptionKey> => {
        const response = await apiClient.patch(`/api/tally-service/elections/${encodeURIComponent(electionId)}/encryption-keys/activate`);
        return response.data;
    },

    tallyElection: async (electionId: string): Promise<ElectionTallyResult[]> => {
        const response = await apiClient.post(`/api/tally-service/elections/${encodeURIComponent(electionId)}/tally`);
        return response.data;
    },
}

export default tallyServiceApi;