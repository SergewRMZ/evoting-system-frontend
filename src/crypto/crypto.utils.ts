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

export const arrayUint8ArrayToBase64 = (bytes: Uint8Array): string => {
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}

export const sha384 = async (data: string): Promise<Uint8Array> => {
    const buffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-384", buffer);
    const array = new Uint8Array(hashBuffer);
    return array;
}