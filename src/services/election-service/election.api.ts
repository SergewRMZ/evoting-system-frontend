import { apiClient } from "../../api/apiClient";
import type {
    Candidate,
    CreateCandidateRequest,
    CreateElectionRequest,
    CreateElectionResponse,
    Election,
    ElectionDetails,
    Position,
} from "./election.types";

const electionServiceApi = {
    getElections: async (): Promise<Election[]> => {
        const response = await apiClient.get("/api/election-service/elections");
        return response.data;
    },

    getElectionDetailsById: async (electionId: string): Promise<ElectionDetails> => {
        const response = await apiClient.get(`/api/election-service/elections/${encodeURIComponent(electionId)}`);
        return response.data;
    },

    createElection: async (election: CreateElectionRequest): Promise<CreateElectionResponse> => {
        const response = await apiClient.post("/api/election-service/elections", election);
        return response.data;
    },

    publishElection: async (electionId: string): Promise<Election> => {
        const response = await apiClient.patch(`/api/election-service/elections/${encodeURIComponent(electionId)}/publish`);
        return response.data;
    },

    validateElection: async (electionId: string): Promise<Election> => {
        const response = await apiClient.patch(`/api/election-service/elections/${encodeURIComponent(electionId)}/validate`);
        return response.data;
    },

    activateElection: async (electionId: string): Promise<Election> => {
        const response = await apiClient.patch(`/api/election-service/elections/${encodeURIComponent(electionId)}/activate`);
        return response.data;
    },

    getPositions: async (): Promise<Position[]> => {
        const response = await apiClient.get("/api/election-service/positions");
        return response.data;
    },

    createPosition: async (positionName: string): Promise<Position> => {
        const response = await apiClient.post("/api/election-service/positions", { positionName });
        return response.data;
    },

    associatePosition: async (electionId: string, positionId: string): Promise<void> => {
        await apiClient.post(
            `/api/election-service/elections/${encodeURIComponent(electionId)}/positions/${encodeURIComponent(positionId)}`,
        );
    },

    getCandidates: async (): Promise<Candidate[]> => {
        const response = await apiClient.get("/api/election-service/candidates");
        return response.data;
    },

    createCandidate: async (candidate: CreateCandidateRequest): Promise<Candidate> => {
        const response = await apiClient.post("/api/election-service/candidates", candidate);
        return response.data;
    },

    addCandidacies: async (electionPositionId: string, candidateIds: string[]): Promise<void> => {
        await apiClient.post(
            `/api/election-service/election-positions/${encodeURIComponent(electionPositionId)}/candidacies`,
            { candidateIds },
        );
    },
}

export default electionServiceApi;