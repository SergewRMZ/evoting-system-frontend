export type AuthorizationPublicKeyStatus = "CREATED" | "ACTIVE" | "EXPIRED";

export type RsaBssaPublicKey = {
    kty: "RSA";
    n: string;
    e: string;
    use?: string;
    kid: string;
    alg?: string;
};

export type AuthorizationPublicKey = {
    authorizationKeysId: string;
    electionId: string;
    publicKey: RsaBssaPublicKey;
    keyStatus: AuthorizationPublicKeyStatus;
    createdAt: string;
}

export type BlindSignature = {
    blindSignature: string
};