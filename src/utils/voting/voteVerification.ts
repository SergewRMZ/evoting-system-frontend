import { canonicalize } from "json-canonicalize";
import {
    base64ToBytes,
    base64UrlToBytes,
    sha3_384Hash,
    Uint8ArrayToBase64,
} from "../../crypto/crypto.utils";
import { verifyRsaPss } from "../../crypto/rsa-bssa/rsaPssVerify";
import type { BulletinBoardVote } from "../../services/bulletin-board-service/bulletin-board.types";
import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";

export type VoteVerificationResult = {
    /** SHA3-384 del voto cifrado en JSON canónico, en Base64. */
    digest: string;
    /** El voto declara la misma clave de autorización que la elección. */
    keyMatches: boolean;
    /** La firma es una firma RSA-PSS válida sobre `randomizer || digest`. */
    signatureValid: boolean;
};

/**
 * Repite en el navegador la verificación que hace el tablón al registrar un voto:
 * recalcula el digesto del voto cifrado y comprueba la firma con la clave pública
 * de autorización de la elección. No requiere confiar en el servidor.
 */
export async function verifyBulletinVote(
    vote: BulletinBoardVote,
    authorizationKey: AuthorizationPublicKey,
): Promise<VoteVerificationResult> {
    const digestBytes = await sha3_384Hash(canonicalize(vote.encryptedVote));
    const randomizer = base64ToBytes(vote.randomizer);

    const preparedMessage = new Uint8Array(randomizer.length + digestBytes.length);
    preparedMessage.set(randomizer, 0);
    preparedMessage.set(digestBytes, randomizer.length);

    let signatureValid: boolean;
    try {
        signatureValid = verifyRsaPss(
            preparedMessage,
            base64ToBytes(vote.signature),
            base64UrlToBytes(authorizationKey.publicKey.n),
            base64UrlToBytes(authorizationKey.publicKey.e),
        );
    } catch {
        signatureValid = false;
    }

    return {
        digest: Uint8ArrayToBase64(digestBytes),
        keyMatches: vote.encryptedVote.authorizationKeysId === authorizationKey.authorizationKeysId,
        signatureValid,
    };
}
