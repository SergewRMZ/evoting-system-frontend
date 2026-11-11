import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { AxiosError, type AxiosResponse } from "axios";
import useBulletinBoard, { VoteAlreadyRegisteredError } from "./useBulletinBoard";
import bulletinBoardServiceApi from "../../services/bulletin-board-service/bulletin-board.api";
import type { SignedVote } from "../../types/vote.types";

vi.mock("../../services/bulletin-board-service/bulletin-board.api", () => ({
  default: { submitVote: vi.fn() },
}));

const conflict = (title: string) =>
  new AxiosError("conflict", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 409,
    data: { title },
  } as AxiosResponse);

const submit = () => {
  const { result } = renderHook(() => useBulletinBoard());
  return result.current.submitVote({} as SignedVote, "eleccion");
};

describe("useBulletinBoard", () => {
  it("no presenta como emitido un voto rechazado por elección no activa", async () => {
    vi.mocked(bulletinBoardServiceApi.submitVote).mockRejectedValue(conflict("Election Not Active"));

    const error = await submit().catch((err: unknown) => err);

    expect(error).not.toBeInstanceOf(VoteAlreadyRegisteredError);
    expect((error as Error).message).toBe("La elección ya no está activa. Tu voto no fue registrado.");
  });

  it("mantiene el aviso de voto ya registrado para los duplicados", async () => {
    vi.mocked(bulletinBoardServiceApi.submitVote).mockRejectedValue(conflict("Duplicate Vote"));

    await expect(submit()).rejects.toBeInstanceOf(VoteAlreadyRegisteredError);
  });
});
