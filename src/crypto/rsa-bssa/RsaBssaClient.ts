import init, {
    JsBlindResult,
    JsRsaBssaPublicKey,
} from "./rsa_bssa";

import {
    base64UrlToBytes
} from "../crypto.utils";

import type { AuthorizationPublicKey } from "../../services/authorization-service/authorization.types";

export class RsaBssaClient {
    private static instance: RsaBssaClient | null = null;
    private static keyId: string | null = null;
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

            RsaBssaClient.instance = new RsaBssaClient(rsaBssa);
            RsaBssaClient.keyId = authorizationPublicKey.authorizationKeysId;
        }

        return RsaBssaClient.instance;
    }

    blind(message: Uint8Array): JsBlindResult {
        return this.rsaBssa.blind(message);
    }

    async unblind(
        blindSignature: Uint8Array,
        blindResult: JsBlindResult,
        message: Uint8Array,
    ) {
        return this.rsaBssa.unblind(
            blindSignature,
            blindResult,
            message
        );
    }
}