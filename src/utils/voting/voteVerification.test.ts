import { constants, generateKeyPairSync, randomBytes, sign } from "node:crypto";
import { canonicalize } from "json-canonicalize";
import { describe, expect, it } from "vitest";
import { sha3_384Hash } from "../../crypto/crypto.utils";
import type { BulletinBoardVote } from "../../services/bulletin-board-service/bulletin-board.types";
import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";
import { verifyBulletinVote } from "./voteVerification";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = publicKey.export({ format: "jwk" });

const authorizationKey: AuthorizationPublicKey = {
  authorizationKeysId: "keys-1",
  electionId: "e1",
  publicKey: { kty: "RSA", n: jwk.n!, e: jwk.e! },
  keyStatus: "ACTIVE",
};

const encryptedVote: BulletinBoardVote["encryptedVote"] = {
  authorizationKeysId: "keys-1",
  positions: [{
    electionPositionId: "p1",
    ballots: [{ candidacyId: "c1", vote: { c1: "AAEC", c2: "AwQF" } }],
  }],
};

// Firma el voto como lo hace el cliente: RSA-PSS sobre randomizer || SHA3-384(JCS(voto)).
async function signedVote(): Promise<BulletinBoardVote> {
  const digest = await sha3_384Hash(canonicalize(encryptedVote));
  const randomizer = randomBytes(32);
  const signature = sign("sha3-384", Buffer.concat([randomizer, digest]), {
    key: privateKey,
    padding: constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 48,
  });
  return {
    voteId: "v1",
    encryptedVote,
    randomizer: randomizer.toString("base64"),
    signature: signature.toString("base64"),
  };
}

describe("verifyBulletinVote", () => {
  it("valida la firma de un voto registrado", async () => {
    const result = await verifyBulletinVote(await signedVote(), authorizationKey);
    expect(result).toMatchObject({ keyMatches: true, signatureValid: true });
  });

  it("detecta un voto cifrado alterado", async () => {
    const vote = await signedVote();
    const altered = structuredClone(vote);
    altered.encryptedVote.positions[0].ballots[0].vote.c1 = "BBEC";
    expect((await verifyBulletinVote(altered, authorizationKey)).signatureValid).toBe(false);
  });

  it("detecta una clave de autorización distinta", async () => {
    const result = await verifyBulletinVote(await signedVote(), { ...authorizationKey, authorizationKeysId: "keys-2" });
    expect(result.keyMatches).toBe(false);
  });
});
