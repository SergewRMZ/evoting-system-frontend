import { sha3_384 } from '@noble/hashes/sha3.js';

export const base64ToBytes = (base64:string): Uint8Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export const base64UrlToBytes = (base64Url: string): Uint8Array => {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export const Uint8ArrayToBase64 = (bytes: Uint8Array): string => {
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}

export const sha3_384Hash = async (data: string): Promise<Uint8Array> => {
    const buffer = new TextEncoder().encode(data);
    return sha3_384(buffer);
}