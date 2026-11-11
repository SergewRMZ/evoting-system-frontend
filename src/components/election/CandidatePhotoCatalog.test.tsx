import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import electionServiceApi from "../../services/election-service/election.api";
import type { Candidate } from "../../services/election-service/election.types";
import { CANDIDATE_PHOTO_MAX_BYTES } from "../../utils/candidatePhoto";
import CandidatePhotoCatalog from "./CandidatePhotoCatalog";

vi.mock("../../services/election-service/election.api", () => ({
  default: { uploadCandidatePhoto: vi.fn() },
}));

const uploadCandidatePhoto = vi.mocked(electionServiceApi.uploadCandidatePhoto);

const candidate = (overrides: Partial<Candidate> = {}): Candidate => ({
  id: "c1",
  name: "Ana",
  lastName: "Ejemplo",
  description: "",
  isActive: true,
  hasPhoto: false,
  ...overrides,
});

const png = (size = 100) => new File([new Uint8Array(size)], "foto.png", { type: "image/png" });

beforeEach(() => {
  vi.resetAllMocks();
});

describe("CandidatePhotoCatalog", () => {
  it("no muestra nada si no hay candidatos", () => {
    const { container } = render(<CandidatePhotoCatalog candidates={[]} onPhotoUploaded={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("marca al candidato sin foto y la sube", async () => {
    uploadCandidatePhoto.mockResolvedValue();
    const onPhotoUploaded = vi.fn();
    render(<CandidatePhotoCatalog candidates={[candidate()]} onPhotoUploaded={onPhotoUploaded} />);

    expect(screen.getByText("Sin fotografía")).toBeInTheDocument();
    const file = png();
    await userEvent.upload(screen.getByLabelText("Fotografía de Ana Ejemplo"), file);

    expect(uploadCandidatePhoto).toHaveBeenCalledWith("c1", file);
    expect(onPhotoUploaded).toHaveBeenCalledWith("c1");
    expect(await screen.findByText("Se guardó la fotografía de Ana Ejemplo.")).toBeInTheDocument();
  });

  it("ofrece cambiar la foto si ya tiene una", () => {
    render(<CandidatePhotoCatalog candidates={[candidate({ hasPhoto: true })]} onPhotoUploaded={vi.fn()} />);
    expect(screen.getByText("Cambiar fotografía")).toBeInTheDocument();
    expect(screen.queryByText("Sin fotografía")).not.toBeInTheDocument();
  });

  it("no sube una imagen que excede el límite", async () => {
    render(<CandidatePhotoCatalog candidates={[candidate()]} onPhotoUploaded={vi.fn()} />);
    await userEvent.upload(screen.getByLabelText("Fotografía de Ana Ejemplo"), png(CANDIDATE_PHOTO_MAX_BYTES + 1));

    expect(uploadCandidatePhoto).not.toHaveBeenCalled();
    expect(screen.getByText(/el máximo es 2 MB/)).toBeInTheDocument();
  });

  it("explica cuando el candidato ya está en una elección publicada", async () => {
    uploadCandidatePhoto.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { title: "Candidate Locked" } },
    });
    const onPhotoUploaded = vi.fn();
    render(<CandidatePhotoCatalog candidates={[candidate()]} onPhotoUploaded={onPhotoUploaded} />);
    await userEvent.upload(screen.getByLabelText("Fotografía de Ana Ejemplo"), png());

    expect(await screen.findByText(/ya compite en una elección publicada/)).toBeInTheDocument();
    expect(onPhotoUploaded).not.toHaveBeenCalled();
  });
});
