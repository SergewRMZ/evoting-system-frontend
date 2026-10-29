import { useState } from "react";
import type { SignedVote } from "../../types/vote.types";
import bulletinBoardServiceApi from "../../services/bulletin-board-service/bulletin-board.api";
import { getApiErrorMessage } from "../../utils/apiError";
const useBulletinBoard = () => {
    const [loading, setLoading] = useState(false);

    const submitVote = async (signedVote: SignedVote, electionId: string) => {
        try {
            setLoading(true);
            
            const data = await bulletinBoardServiceApi.submitVote(signedVote, electionId);
            return data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, "No se pudo registrar el voto."), { cause: error });
        }
    }

    return {
        loading,
        submitVote
    }
}

export default useBulletinBoard;