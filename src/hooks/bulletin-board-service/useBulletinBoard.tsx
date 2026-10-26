import { useState } from "react";
import type { SignedVote } from "../../types/vote.types";
import bulletinBoardServiceApi from "../../services/bulletin-board-service/bulletin-board.api";
import axios from "axios";
const useBulletinBoard = () => {
    const [loading, setLoading] = useState(false);

    const submitVote = async (signedVote: SignedVote, electionId: string) => {
        try {
            setLoading(true);
            
            const data = await bulletinBoardServiceApi.submitVote(signedVote, electionId);
            console.log(data);
        } catch (error) {
            if(axios.isAxiosError(error)) {
                const problemDetails = error.response?.data;
                if (problemDetails?.detail) {
                    throw new Error(problemDetails.detail, {cause: error});
                }
            }

            throw Error;
        }
    }

    return {
        loading,
        submitVote
    }
}

export default useBulletinBoard;