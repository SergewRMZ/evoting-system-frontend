import { type EncryptedVotePayload, type VotePayload } from "../../types/vote.types";
import { type ElectionDetails } from "../../services/election-service/election.types";
import EllipticCurveElGamal from "../../crypto/ecc-elgamal/ecc.elgamal";
import {
    base64ToBytes,
    base64UrlToBytes,
    sha3_384Hash,
    Uint8ArrayToBase64,
} from "../../crypto/crypto.utils";
import type { EncryptionPublicKey } from "../../services/tally-service/tally-service.types";
import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";
import { canonicalize } from "json-canonicalize";
import { RsaBssaClient } from "../../crypto/rsa-bssa/RsaBssaClient";
import type { JsBlindResult } from "../../crypto/rsa-bssa/rsa_bssa";

export const createVotePayload = (
    election: ElectionDetails,
    selectedCandidacies: Record<string, string>,
    authorizationKeysId: string,
): VotePayload => {
  return {
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
        authorizationKeysId: vote.authorizationKeysId,
        positions: vote.positions.map((position) => ({
            electionPositionId: position.electionPositionId,

            ballots: position.ballot.map((choice) => ({
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
    const rsaBssa = await RsaBssaClient.getInstance(authorizationPublicKey);
    return rsaBssa.blind(voteDigest);
}

export const unblindVote = async (
    blindSignature: string, 
    blindedVote: JsBlindResult,
    digest: Uint8Array,
    authorizationPublicKey: AuthorizationPublicKey
): Promise<string> => {
    const rsaBssaClient = await RsaBssaClient.getInstance(authorizationPublicKey);
    const jsRsaBssaSignature = await rsaBssaClient.unblind(base64UrlToBytes(blindSignature), blindedVote, digest);
    return Uint8ArrayToBase64(jsRsaBssaSignature.signature);
}

export const createBlindedVoteMessage = async (
    election: ElectionDetails,
    selectedCandidacies: Record<string, string>,
    encryptionPublicKey: EncryptionPublicKey,
    authorizationPublicKey: AuthorizationPublicKey,
) => {
    const votePayload = createVotePayload(
        election,
        selectedCandidacies,
        authorizationPublicKey.authorizationKeysId,
    );
    const encryptedVote: EncryptedVotePayload = encryptVote(votePayload, encryptionPublicKey);
    console.log("JSON formateado:", canonicalize(encryptedVote));
    const digest: Uint8Array = await sha3_384Hash(canonicalize(encryptedVote));
    const blindResult: JsBlindResult = await blindVote(digest, authorizationPublicKey);
    return {
        encryptedVote,
        digest,
        blindResult
    };
};