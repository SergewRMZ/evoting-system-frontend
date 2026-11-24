import type { SignedVote } from "../../types/vote.types";
import type { BulletinBoardPage, SubmitVoteResponse } from "./bulletin-board.types";
import { publicApiClient } from "../../api/apiClient";

const bulletinBoardServiceApi = {
    submitVote: async(signedVote: SignedVote, electionId: string): Promise<SubmitVoteResponse> => {
        const response = await publicApiClient.post(`/api/bulletin-board/elections/${encodeURIComponent(electionId)}/votes`, signedVote);
        return response.data;
    },

    // La consulta del tablón va sin token: auditar no requiere cuenta, y así el
    // servidor no puede asociar la búsqueda de un voto con la identidad de quien busca.
    getVotes: async (electionId: string, page = 0, size = 10): Promise<BulletinBoardPage> => {
        const response = await publicApiClient.get(
            `/api/bulletin-board/elections/${encodeURIComponent(electionId)}/votes`,
            { params: { page, size } },
        );
        return response.data;
    },

    findVote: async (electionId: string, voteId: string): Promise<{ vote: BulletinBoardPage["content"][number] | null; page: number }> => {
        const pageSize = 100;
        const firstPage = await bulletinBoardServiceApi.getVotes(electionId, 0, pageSize);
        const foundOnFirstPage = firstPage.content.find((vote) => vote.voteId === voteId);
        if (foundOnFirstPage) return { vote: foundOnFirstPage, page: 0 };

        for (let page = 1; page < firstPage.totalPages; page += 1) {
            const result = await bulletinBoardServiceApi.getVotes(electionId, page, pageSize);
            const vote = result.content.find((item) => item.voteId === voteId);
            if (vote) return { vote, page };
        }

        return { vote: null, page: 0 };
    },
}

export default bulletinBoardServiceApi;