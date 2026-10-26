import type { ElGamalCiphertext } from "../crypto/ecc-elgamal/ecc.elgamal.types";

export type VoteChoice = 0 | 1;

/**
 * Define el tipo de dato del voto antes de ser cifrado.
 * Tipo de dato que se establece una vez que el usuario a seleccionado a
 * los candidatos de su preferencia.
 */
export interface VotePayload {
  authorizationKeysId: string;
  positions: {
    electionPositionId: string;
    ballot: {
      candidacyId: string;
      vote: VoteChoice;
    }[];
  }[];
};

/**
 * Define el tipo de dato para el voto una vez que se ha cifrado cada una 
 * de las elecciones del votante.
 */
export interface EncryptedVotePayload {
    authorizationKeysId: string;
    positions: {
        electionPositionId: string;
        ballots: {
            candidacyId: string;
            vote: ElGamalCiphertext;
        }[];
    }[];
};

export interface SignedVote {
  encryptedVote: EncryptedVotePayload,
  randomizer: string,
  digest: string,
  signature: string, 
}