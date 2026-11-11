import { describe, expect, it } from "vitest";
import { CANDIDATE_PHOTO_MAX_BYTES, validateCandidatePhoto } from "./candidatePhoto";

function fileOf(size: number, type: string) {
  return new File([new Uint8Array(size)], "foto", { type });
}

describe("validateCandidatePhoto", () => {
  it("acepta JPG, PNG y WebP dentro del límite", () => {
    expect(validateCandidatePhoto(fileOf(1000, "image/jpeg"))).toBeNull();
    expect(validateCandidatePhoto(fileOf(1000, "image/png"))).toBeNull();
    expect(validateCandidatePhoto(fileOf(CANDIDATE_PHOTO_MAX_BYTES, "image/webp"))).toBeNull();
  });

  it("rechaza una imagen que excede el límite e indica su tamaño", () => {
    const message = validateCandidatePhoto(fileOf(CANDIDATE_PHOTO_MAX_BYTES + 1, "image/png"));
    expect(message).toContain("2 MB");
  });

  it("rechaza formatos no permitidos, como SVG", () => {
    expect(validateCandidatePhoto(fileOf(1000, "image/svg+xml"))).toContain("Formato no permitido");
  });

  it("rechaza un archivo vacío", () => {
    expect(validateCandidatePhoto(fileOf(0, "image/png"))).toBe("El archivo está vacío.");
  });
});
