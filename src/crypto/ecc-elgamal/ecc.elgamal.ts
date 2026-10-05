import { secp256k1 } from '@noble/curves/secp256k1.js';
import { bytesToNumberBE } from '@noble/curves/utils.js';
import { type ElGamalCiphertext } from './ecc.elgamal.types';
import { arrayUint8ArrayToBase64 } from '../crypto.utils';
class EllipticCurveElGamal {
    private readonly curve: typeof secp256k1 = secp256k1;
    private readonly publicKey;

    constructor(publicKeyBytes: Uint8Array) {
        this.publicKey = this.curve.Point.fromBytes(publicKeyBytes);
    }

    public encrypt(message: bigint): ElGamalCiphertext {
        if(message < 0n) throw new RangeError("Message must be a non-negative integer");
        const messagePoint = message === 0n 
            ? this.curve.Point.ZERO 
            : this.curve.Point.BASE.multiply(message);

        const keBint = bytesToNumberBE(this.curve.utils.randomSecretKey());
        const P = this.curve.Point.BASE.multiply(keBint);
        const Q = messagePoint.add(this.publicKey.multiply(keBint));

        return {
            c1: arrayUint8ArrayToBase64(P.toBytes(true)),
            c2: arrayUint8ArrayToBase64(Q.toBytes(true)),
        };
    }
}

export default EllipticCurveElGamal;