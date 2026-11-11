import { useState } from "react";
import type { SignedVote } from "../../types/vote.types";
import bulletinBoardServiceApi from "../../services/bulletin-board-service/bulletin-board.api";
import { getApiErrorMessage } from "../../errors/apiErrorMap";
import axios from "axios";

export class VoteAlreadyRegisteredError extends Error {
    readonly voteId?: string;

    constructor(voteId?: string) {
        super("La API indica que tu voto ya había sido registrado para esta elección.");
        this.name = "VoteAlreadyRegisteredError";
        this.voteId = voteId;
    }
}

// El tablón también responde 409 cuando la elección no está activa, pero en ese
// caso el voto no quedó registrado.
function isElectionNotActive(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;
    const data: unknown = error.response?.data;
    if (!data || typeof data !== "object") return false;
    return (data as Record<string, unknown>).title === "Election Not Active";
}

function getVoteIdFromConflict(error: unknown): string | undefined {
    if (!axios.isAxiosError(error)) return undefined;
    const data: unknown = error.response?.data;
    if (!data || typeof data !== "object") return undefined;
    const voteId = (data as Record<string, unknown>).voteId;
    return typeof voteId === "string" ? voteId : undefined;
}

const useBulletinBoard = () => {
    const [loading, setLoading] = useState(false);

    const submitVote = async (signedVote: SignedVote, electionId: string) => {
        try {
            setLoading(true);
            
            const data = await bulletinBoardServiceApi.submitVote(signedVote, electionId);
            return data;
        } catch (error) {
            if (isElectionNotActive(error)) {
                throw new Error("La elección ya no está activa. Tu voto no fue registrado.", { cause: error });
            }
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                throw new VoteAlreadyRegisteredError(getVoteIdFromConflict(error));
            }
            throw new Error(getApiErrorMessage(error, "bulletin-board", "No se pudo registrar el voto."), { cause: error });
        }
    }

    return {
        loading,
        submitVote
    }
}

export default useBulletinBoard;