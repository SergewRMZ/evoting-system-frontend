import { type EncryptedVotePayload, type VotePayload } from "../../types/vote.types";
import { type ElectionDetails } from "../../services/election-service/election.types";
import EllipticCurveElGamal from "../../crypto/ecc-elgamal/ecc.elgamal";
import {
    arrayUint8ArrayToBase64,
    base64ToBytes,
    base64UrlToBytes,
    sha384,
} from "../../crypto/crypto.utils";
import type { EncryptionPublicKey } from "../../services/tally-service/tally-service.types";
import init, { JsBlindResult, JsRsaBssaPublicKey } from "../../crypto/rsa-bssa/rsa_bssa";
import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";
import { canonicalize } from "json-canonicalize";

export const createVotePayload = (
    election: ElectionDetails,
    selectedCandidacies: Record<string, string>,
    authorizationKeysId: string,
): VotePayload => {
  return {
      electionId: election.electionId,
      authorizationKeysId,

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
        authorizationKeysId: vote.authorizationKeysId,
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

export const createBlindedVoteMessage = async (
    election: ElectionDetails,
    selectedCandidacies: Record<string, string>,
    encryptionPublicKey: EncryptionPublicKey,
    authorizationPublicKey: AuthorizationPublicKey,
): Promise<string> => {
    const votePayload = createVotePayload(
        election,
        selectedCandidacies,
        authorizationPublicKey.authorizationKeysId,
    );
    const encryptedVote = canonicalize(encryptVote(votePayload, encryptionPublicKey));
    const voteDigest = await sha384(encryptedVote);
    const blindedVote = await blindVote(voteDigest, authorizationPublicKey);

    return arrayUint8ArrayToBase64(blindedVote.blinded_message);
};