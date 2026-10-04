import { apiClient } from "../../api/apiClient";

export const electionApi = {
  getElections: async () => {
    const response = await apiClient.get("/api/election-service/elections");
    const data = response.data;
    return data;
  },

  getElectionDetailsById: async (electionId: string) => {
    const response = await apiClient.get(`/api/election-service/elections/${electionId}`);
    return response.data;
  }
}