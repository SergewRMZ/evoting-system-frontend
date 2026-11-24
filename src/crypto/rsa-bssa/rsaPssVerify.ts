import { sha3_384 } from "@noble/hashes/sha3.js";

/**
 * Verificación de firmas RSA-PSS (EMSA-PSS-VERIFY, RFC 8017 §9.1.2) en el navegador.
 *
 * Usa los mismos parámetros que el tablón público (`RsaBssaVerifier.java`): SHA3-384
 * como función hash y en MGF1, y un salt de 48 bytes. La librería WASM de RSA-BSSA
 * no expone verificación, y WebCrypto no admite SHA3, por eso se implementa aquí.
 */

const HASH_LENGTH = 48;
export const RSA_PSS_SALT_LENGTH = 48;

const hash = (data: Uint8Array): Uint8Array => sha3_384(data);

function bytesToBigInt(bytes: Uint8Array): bigint {
    let value = 0n;
    for (const byte of bytes) value = (value << 8n) | BigInt(byte);
    return value;
}

function bigIntToBytes(value: bigint, length: number): Uint8Array | null {
    const bytes = new Uint8Array(length);
    let rest = value;
    for (let i = length - 1; i >= 0; i -= 1) {
        bytes[i] = Number(rest & 0xffn);
        rest >>= 8n;
    }
    return rest === 0n ? bytes : null;
}

function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    let result = 1n;
    let b = base % modulus;
    let e = exponent;
    while (e > 0n) {
        if (e & 1n) result = (result * b) % modulus;
        b = (b * b) % modulus;
        e >>= 1n;
    }
    return result;
}

function bitLength(value: bigint): number {
    return value.toString(2).length;
}

function concat(...parts: Uint8Array[]): Uint8Array {
    const out = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
    let offset = 0;
    for (const part of parts) {
        out.set(part, offset);
        offset += part.length;
    }
    return out;
}

/** MGF1 con SHA3-384: concatena h(seed || contador) hasta cubrir `maskLength` bytes. */
export function mgf1(seed: Uint8Array, maskLength: number): Uint8Array {
    const blocks: Uint8Array[] = [];
    const counter = new Uint8Array(4);
    for (let i = 0; i * HASH_LENGTH < maskLength; i += 1) {
        new DataView(counter.buffer).setUint32(0, i);
        blocks.push(hash(concat(seed, counter)));
    }
    return concat(...blocks).slice(0, maskLength);
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
    return diff === 0;
}

/**
 * Comprueba que `signature` sea una firma RSA-PSS válida de `message` con la clave
 * pública (`n`, `e`) en bytes big-endian.
 */
export function verifyRsaPss(
    message: Uint8Array,
    signature: Uint8Array,
    modulus: Uint8Array,
    publicExponent: Uint8Array,
    saltLength = RSA_PSS_SALT_LENGTH,
): boolean {
    const n = bytesToBigInt(modulus);
    const e = bytesToBigInt(publicExponent);
    const s = bytesToBigInt(signature);
    if (n === 0n || s >= n) return false;

    // EM = s^e mod n, con emBits = modBits - 1.
    const emBits = bitLength(n) - 1;
    const emLength = Math.ceil(emBits / 8);
    const em = bigIntToBytes(modPow(s, e, n), emLength);
    if (!em) return false;

    if (emLength < HASH_LENGTH + saltLength + 2) return false;
    if (em[emLength - 1] !== 0xbc) return false;

    const maskedDb = em.slice(0, emLength - HASH_LENGTH - 1);
    const h = em.slice(emLength - HASH_LENGTH - 1, emLength - 1);

    // Los bits más significativos que sobran de emBits deben ser cero.
    const unusedBits = 8 * emLength - emBits;
    const topMask = (0xff << (8 - unusedBits)) & 0xff;
    if (unusedBits > 0 && (maskedDb[0] & topMask) !== 0) return false;

    const dbMask = mgf1(h, maskedDb.length);
    const db = maskedDb.map((byte, i) => byte ^ dbMask[i]);
    if (unusedBits > 0) db[0] &= ~topMask & 0xff;

    // DB = PS (ceros) || 0x01 || salt
    const separator = emLength - HASH_LENGTH - saltLength - 2;
    for (let i = 0; i < separator; i += 1) {
        if (db[i] !== 0) return false;
    }
    if (db[separator] !== 0x01) return false;

    const salt = db.slice(db.length - saltLength);
    const mPrime = concat(new Uint8Array(8), hash(message), salt);
    return sameBytes(hash(mPrime), h);
}
