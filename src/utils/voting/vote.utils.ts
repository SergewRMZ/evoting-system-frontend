import { type EncryptedVotePayload, type VotePayload } from "../../types/vote.types";
import { type ElectionDetails } from "../../services/election-service/election.types";
import EllipticCurveElGamal from "../../crypto/ecc-elgamal/ecc.elgamal";
import { base64ToBytes, base64UrlToBytes } from "../../crypto/crypto.utils";
import type { EncryptionPublicKey } from "../../services/tally-service/tally-service.types";
import init, { JsBlindResult, JsRsaBssaPublicKey } from "../../crypto/rsa-bssa/rsa_bssa";
import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";

export const createVotePayload = (
    election: ElectionDetails,
    selectedCandidacies: Record<string, string>,
): VotePayload => {
  return {
      electionId: election.electionId,

      positions: election.positions.map((position) => ({
            electionPositionId: position.electionPositionId,
            ballot: position.candidacies.map((candidacy) => ({
                candidacyId: candidacy.candidacyId,

            vote:
                selectedCandidacies[position.electionPositionId] ===
                candidacy.candidacyId
                    ? 1
                    : 0,
            })),
      })),
  };
};

export const encryptVote = (
    vote: VotePayload, 
    encryptionPublicKey: EncryptionPublicKey
): EncryptedVotePayload => {
    
    const publicKeyBytes = base64ToBytes(encryptionPublicKey.publicKey);
    const elGamal = new EllipticCurveElGamal(publicKeyBytes);

    return {
        electionId: vote.electionId,
        positions: vote.positions.map((position) => ({
            electionPositionId: position.electionPositionId,

            ballot: position.ballot.map((choice) => ({
                candidacyId: choice.candidacyId,
                vote: elGamal.encrypt(BigInt(choice.vote))
            }))
        }))
    };
}

export const blindVote = async (
    voteDigest: Uint8Array, 
    authorizationPublicKey: AuthorizationPublicKey
): Promise<JsBlindResult> => {

    await init();

    const nBytes: Uint8Array = base64UrlToBytes(authorizationPublicKey.publicKey.n);
    const eBytes: Uint8Array = base64UrlToBytes(authorizationPublicKey.publicKey.e);
    const rsaBssa: JsRsaBssaPublicKey = new JsRsaBssaPublicKey(nBytes, eBytes);
    return rsaBssa.blind(voteDigest);
}