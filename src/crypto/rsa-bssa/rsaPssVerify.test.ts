import { constants, generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyRsaPss } from "./rsaPssVerify";

// Firmas generadas con OpenSSL (Node) con los mismos parámetros que el tablón:
// RSA-PSS, SHA3-384 en el hash y en MGF1, salt de 48 bytes.
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = publicKey.export({ format: "jwk" });
const toBytes = (base64Url: string) => new Uint8Array(Buffer.from(base64Url, "base64url"));
const n = toBytes(jwk.n!);
const e = toBytes(jwk.e!);

const signPss = (message: Uint8Array) =>
  new Uint8Array(sign("sha3-384", message, {
    key: privateKey,
    padding: constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 48,
  }));

describe("verifyRsaPss", () => {
  const message = new TextEncoder().encode("randomizer||digest");

  it("acepta una firma válida", () => {
    expect(verifyRsaPss(message, signPss(message), n, e)).toBe(true);
  });

  it("rechaza la firma si el mensaje cambia", () => {
    const signature = signPss(message);
    const altered = new TextEncoder().encode("randomizer||digesT");
    expect(verifyRsaPss(altered, signature, n, e)).toBe(false);
  });

  it("rechaza una firma alterada", () => {
    const signature = signPss(message);
    signature[10] ^= 0x01;
    expect(verifyRsaPss(message, signature, n, e)).toBe(false);
  });

  it("rechaza la firma con otra clave pública", () => {
    const other = generateKeyPairSync("rsa", { modulusLength: 2048 }).publicKey.export({ format: "jwk" });
    expect(verifyRsaPss(message, signPss(message), toBytes(other.n!), toBytes(other.e!))).toBe(false);
  });
});
