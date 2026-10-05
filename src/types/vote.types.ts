import type { ElGamalCiphertext } from "../crypto/ecc-elgamal/ecc.elgamal.types";

export type VoteChoice = 0 | 1;

export type VotePayload = {
  electionId: string;
  authorizationKeysId: string;
  positions: {
    electionPositionId: string;
    ballot: {
      candidacyId: string;
      vote: VoteChoice;
    }[];
  }[];
};

export type EncryptedVotePayload = {
    electionId: string;
    authorizationKeysId: string;
    positions: {
        electionPositionId: string;
        ballot: {
            candidacyId: string;
            vote: ElGamalCiphertext;
        }[];
    }[];
};