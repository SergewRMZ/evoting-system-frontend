import init, {
    JsBlindResult,
    JsRsaBssaPublicKey,
} from "./rsa_bssa";

import {
    base64ToBytes,
    base64UrlToBytes
} from "../crypto.utils";

import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";

export class RsaBssaClient {
    private static instance: RsaBssaClient | null = null;
    private static keyId: string | null;
    private readonly rsaBssa: JsRsaBssaPublicKey;

    private constructor(rsaBssa: JsRsaBssaPublicKey) {
        this.rsaBssa = rsaBssa;
    }

    static async getInstance(
        authorizationPublicKey: AuthorizationPublicKey
    ): Promise<RsaBssaClient> {

        if (RsaBssaClient.instance === null || RsaBssaClient.keyId !== authorizationPublicKey.authorizationKeysId) {

            await init();

            const nBytes = base64UrlToBytes(
                authorizationPublicKey.publicKey.n
            );

            const eBytes = base64UrlToBytes(
                authorizationPublicKey.publicKey.e
            );

            const rsaBssa = new JsRsaBssaPublicKey(
                nBytes,
                eBytes
            );

            RsaBssaClient.instance =
                new RsaBssaClient(rsaBssa);
        }

        return RsaBssaClient.instance;
    }

    blind(message: Uint8Array): JsBlindResult {
        return this.rsaBssa.blind(message);
    }

    async unblind(
        blindSignature: string,
        blindResult: JsBlindResult,
        message: Uint8Array,
    ) {
        const blindSignatureBytes =
            base64ToBytes(blindSignature);

        return this.rsaBssa.unblind(
            blindSignatureBytes,
            blindResult,
            message
        );
    }
}