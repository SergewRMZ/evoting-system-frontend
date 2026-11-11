import { describe, expect, it, vi } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";
import { publicApiClient } from "../../api/apiClient";
import bulletinBoardServiceApi from "./bulletin-board.api";
import type { SignedVote } from "../../types/vote.types";

vi.mock("../../auth/keycloakConfig", () => ({
  default: {
    authenticated: true,
    token: "token-del-votante",
    updateToken: vi.fn().mockResolvedValue(true),
  },
}));

describe("bulletinBoardServiceApi.submitVote", () => {
  it("envía el voto sin el token del votante", async () => {
    let sent: InternalAxiosRequestConfig | undefined;
    publicApiClient.defaults.adapter = async (config) => {
      sent = config;
      return { data: { voteId: "1" }, status: 201, statusText: "Created", headers: {}, config };
    };

    await bulletinBoardServiceApi.submitVote({} as SignedVote, "eleccion");

    expect(sent?.url).toContain("/api/bulletin-board/elections/eleccion/votes");
    expect(sent?.headers.has("Authorization")).toBe(false);
  });
});
