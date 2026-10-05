import { apiClient  } from "../../api/apiClient";
import type { EncryptionPublicKey } from "./tally-service.types";
const tallyServiceApi = {
    getPublicKey: async (electionId: string): Promise<EncryptionPublicKey> => {
        const response = await apiClient.get(`/api/tally-service/elections/${electionId}/encryption-keys/public`);
        return response.data;
    }
}

export default tallyServiceApi;