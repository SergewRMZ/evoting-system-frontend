export type ElGamalPublicKeyStatus = "CREATED" | "ACTIVE" | "EXPIRED";

export type EncryptionPublicKey = {
    encryptionKeyId: string,
    electionId: string,
    publicKey: string,
    status: ElGamalPublicKeyStatus,
    createdAt: string
};

