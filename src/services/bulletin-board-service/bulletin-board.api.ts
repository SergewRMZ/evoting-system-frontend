import type { SignedVote } from "../../types/vote.types";
import type { SubmitVoteResponse } from "./bulletin-board.types";
import { apiClient } from "../../api/apiClient";

const bulletinBoardServiceApi = {
    submitVote: async(signedVote: SignedVote, electionId: string): Promise<SubmitVoteResponse> => {
        const response = await apiClient.post(`/api/bulletin-board/elections/${electionId}/votes`, signedVote);
        return response.data;
    }
}

export default bulletinBoardServiceApi;