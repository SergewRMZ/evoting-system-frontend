export type ElGamalPublicKeyStatus = "CREATED" | "ACTIVE" | "EXPIRED";

export type EncryptionPublicKey = {
    encryptionKeyId: string,
    electionId: string,
    publicKey: string,
    status: ElGamalPublicKeyStatus,
    createdAt: string
};

export type EncryptionKey = EncryptionPublicKey;

export type ElectionTallyResult = {
    id: string | null;
    electionPositionId: string;
    candidacyId: string;
    totalVotes: number;
    result: number;
    createdAt: string;
};
