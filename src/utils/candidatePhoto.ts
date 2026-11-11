import { getApiErrorMessage, getProblemTitle } from "../errors/apiErrorMap";

// Debe coincidir con election.candidate-photo.max-size en election-service.
export const CANDIDATE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const CANDIDATE_PHOTO_MAX_LABEL = "2 MB";

export const CANDIDATE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const CANDIDATE_PHOTO_ACCEPT = CANDIDATE_PHOTO_TYPES.join(",");
export const CANDIDATE_PHOTO_RULES = `JPG, PNG o WebP de máximo ${CANDIDATE_PHOTO_MAX_LABEL}.`;
export const CANDIDATE_PHOTO_HINT = `Opcional. ${CANDIDATE_PHOTO_RULES}`;

/**
 * Devuelve el mensaje de error para mostrar al administrador, o null si la imagen es válida.
 * El backend repite estas validaciones y además revisa el contenido real del archivo.
 */
export function validateCandidatePhoto(file: File): string | null {
  if (!CANDIDATE_PHOTO_TYPES.includes(file.type)) {
    return "Formato no permitido. Usa una imagen JPG, PNG o WebP.";
  }
  if (file.size === 0) {
    return "El archivo está vacío.";
  }
  if (file.size > CANDIDATE_PHOTO_MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `La imagen pesa ${sizeMb} MB y el máximo es ${CANDIDATE_PHOTO_MAX_LABEL}.`;
  }
  return null;
}

/**
 * `version` cambia la URL después de reemplazar la foto, para que el <img> la vuelva a pedir.
 * El backend ignora el parámetro.
 */
export function getCandidatePhotoUrl(candidateId: string, version?: number): string {
  const url = `${import.meta.env.VITE_API_BASE_URL}/api/election-service/candidates/${encodeURIComponent(candidateId)}/photo`;
  return version ? `${url}?v=${version}` : url;
}

export function getCandidatePhotoErrorMessage(error: unknown): string {
  if (getProblemTitle(error) === "Candidate Locked") {
    return "El candidato ya compite en una elección publicada, así que su fotografía no puede cambiarse.";
  }
  return getApiErrorMessage(error, "election", "No se pudo guardar la fotografía.");
}
