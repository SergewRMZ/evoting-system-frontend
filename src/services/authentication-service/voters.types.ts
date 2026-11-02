export type VoterRegistrationStatus = "PENDING" | "APPROVED";

export type VoterRegistration = {
  userId: string;
  username: string;
  email: string | null;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  matricula: string | null;
  /** La matrícula tiene exactamente 10 dígitos. */
  matriculaValid: boolean;
  enabled: boolean;
  registeredAt: string | null;
  status: VoterRegistrationStatus;
};

export type VoterRegistrationPage = {
  content: VoterRegistration[];
  page: number;
  size: number;
  totalElements: number;
  /** Totales globales, independientes del filtro aplicado. */
  pendingCount: number;
  approvedCount: number;
};

export type VoterRegistrationQuery = {
  status?: VoterRegistrationStatus;
  search?: string;
  page: number;
  size: number;
};

/** Motivos por los que el backend rechaza una aprobación (`code` del ProblemDetail). */
export type VoterApprovalRejection =
  | "ALREADY_APPROVED"
  | "PRIVILEGED_ACCOUNT"
  | "ACCOUNT_DISABLED"
  | "INVALID_MATRICULA"
  | "DUPLICATE_MATRICULA";
