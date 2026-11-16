import { apiClient } from "../../api/apiClient";
import type {
    Candidate,
    AssociatePositionResponse,
    CreateCandidateRequest,
    CreateCandidacyResponse,
    CreateElectionRequest,
    CreateElectionResponse,
    Election,
    ElectionDetails,
    Position,
    UpdateElectionRequest,
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

    updateElection: async (electionId: string, election: UpdateElectionRequest): Promise<Election> => {
        const response = await apiClient.put(`/api/election-service/elections/${encodeURIComponent(electionId)}`, election);
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

    /** CLOSED → FINISHED. Solo la autoridad, después de contabilizar los votos. */
    finishElection: async (electionId: string): Promise<Election> => {
        const response = await apiClient.patch(`/api/election-service/elections/${encodeURIComponent(electionId)}/finish`);
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

    associatePosition: async (electionId: string, positionId: string): Promise<AssociatePositionResponse> => {
        const response = await apiClient.post(
            `/api/election-service/elections/${encodeURIComponent(electionId)}/positions/${encodeURIComponent(positionId)}`,
        );
        return response.data;
    },

    getCandidates: async (): Promise<Candidate[]> => {
        const response = await apiClient.get("/api/election-service/candidates");
        return response.data;
    },

    createCandidate: async (candidate: CreateCandidateRequest): Promise<Candidate> => {
        const response = await apiClient.post("/api/election-service/candidates", candidate);
        return response.data;
    },

    uploadCandidatePhoto: async (candidateId: string, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append("file", file);
        // Sin este encabezado, axios convertiría el FormData a JSON por el Content-Type del cliente.
        await apiClient.put(
            `/api/election-service/candidates/${encodeURIComponent(candidateId)}/photo`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
        );
    },

    addCandidacies: async (electionPositionId: string, candidateIds: string[]): Promise<CreateCandidacyResponse[]> => {
        const response = await apiClient.post(
            `/api/election-service/election-positions/${encodeURIComponent(electionPositionId)}/candidacies`,
            { candidateIds },
        );
        return response.data;
    },
}

export default electionServiceApi;