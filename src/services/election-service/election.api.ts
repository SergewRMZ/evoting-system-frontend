import { apiClient } from "../../api/apiClient";
import type { Election, ElectionDetails } from "./election.types";

const electionServiceApi = {
    getElections: async (): Promise<Election[]> => {
        const response = await apiClient.get("/api/election-service/elections");
        const data = response.data;
        return data;
    },

    getElectionDetailsById: async (electionId: string): Promise<ElectionDetails> => {
        const response = await apiClient.get(`/api/election-service/elections/${electionId}`);
        return response.data;
    }
}

export default electionServiceApi;