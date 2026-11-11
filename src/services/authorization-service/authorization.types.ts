export type AuthorizationPublicKeyStatus = "CREATED" | "ACTIVE" | "EXPIRED";

export type RsaBssaPublicKey = {
    kty: "RSA";
    n: string;
    e: string;
    use?: string;
    kid?: string;
    alg?: string;
};

export type AuthorizationPublicKey = {
    authorizationKeysId: string;
    electionId: string;
    publicKey: RsaBssaPublicKey;
    keyStatus: AuthorizationPublicKeyStatus;
    createdAt?: string;
}

export type BlindSignature = {
    authorizationKeysId: string;
    blindSignature: string;
    electionId: string;
    issuedAt: string;
    userId: string;
};

/** Si el votante del token ya obtuvo su firma ciega en la elección. */
export type AuthorizationStatus = {
    electionId: string;
    authorized: boolean;
};

export type AuthorizationKeys = {
    authorizationKeysId: string;
    electionId: string;
    publicKey: RsaBssaPublicKey;
    keyStatus: AuthorizationPublicKeyStatus;
    createdAt: string;
};