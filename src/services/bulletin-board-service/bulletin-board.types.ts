export interface SubmitVoteResponse {
	voteId: string,
    message: string
}

export type BulletinBoardVote = {
    voteId: string;
    encryptedVote: {
        authorizationKeysId: string;
        positions: {
            electionPositionId: string;
            ballots: {
                candidacyId: string;
                vote: { c1: string; c2: string };
            }[];
        }[];
    };
    randomizer: string;
    digest?: string;
    signature: string;
};

export type BulletinBoardPage = {
    content: BulletinBoardVote[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
};
