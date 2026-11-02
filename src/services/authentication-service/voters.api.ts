import { apiClient } from "../../api/apiClient";
import { getApiErrorMessage, getHttpStatus } from "../../errors/apiErrorMap";
import type {
  VoterApprovalRejection,
  VoterRegistration,
  VoterRegistrationPage,
  VoterRegistrationQuery,
} from "./voters.types";

const votersApi = {
    getRegistrations: async (query: VoterRegistrationQuery): Promise<VoterRegistrationPage> => {
        const response = await apiClient.get("/api/auth/voters", {
            params: {
                status: query.status,
                search: query.search?.trim() || undefined,
                page: query.page,
                size: query.size,
            },
        });
        return response.data;
    },

    approve: async (userId: string): Promise<VoterRegistration> => {
        const response = await apiClient.patch(`/api/auth/voters/${encodeURIComponent(userId)}/approve`);
        return response.data;
    },
};

const REJECTION_MESSAGES: Record<VoterApprovalRejection, string> = {
    ALREADY_APPROVED: "Esta cuenta ya había sido aprobada como votante.",
    PRIVILEGED_ACCOUNT: "Es una cuenta administrativa; no se gestiona desde la aprobación de votantes.",
    ACCOUNT_DISABLED: "La cuenta está deshabilitada y no puede aprobarse.",
    INVALID_MATRICULA: "La cuenta no tiene una matrícula válida de 10 dígitos.",
    DUPLICATE_MATRICULA: "Otro votante aprobado ya utiliza esta matrícula.",
};

export const getApprovalRejection = (error: unknown): VoterApprovalRejection | undefined => {
    const code = (error as { response?: { data?: { code?: unknown } } })?.response?.data?.code;
    return typeof code === "string" && code in REJECTION_MESSAGES ? (code as VoterApprovalRejection) : undefined;
};

/** Mensaje para el usuario cuando falla una aprobación. */
export function getApprovalErrorMessage(error: unknown): string {
    const rejection = getApprovalRejection(error);
    if (rejection) return REJECTION_MESSAGES[rejection];
    if (getHttpStatus(error) === 404) return "La cuenta ya no existe en el proveedor de identidad.";
    return getApiErrorMessage(error, "auth", "No se pudo aprobar la solicitud.");
}

export default votersApi;
