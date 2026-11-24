import { describe, expect, it, vi } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";
import { publicApiClient } from "../../api/apiClient";
import bulletinBoardServiceApi from "./bulletin-board.api";
import authorizationServiceApi from "../authorization-service/authorization.api";
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

describe("consultas para auditar el tablón", () => {
  const captureRequests = () => {
    const sent: InternalAxiosRequestConfig[] = [];
    publicApiClient.defaults.adapter = async (config) => {
      sent.push(config);
      const data = config.url?.includes("/keys/public")
        ? { authorizationKeysId: "k", publicKey: { kty: "RSA", n: "AQ", e: "AQAB" } }
        : { content: [], totalElements: 0, totalPages: 0, last: true };
      return { data, status: 200, statusText: "OK", headers: {}, config };
    };
    return sent;
  };

  it("consulta los votos sin el token del usuario", async () => {
    const sent = captureRequests();

    await bulletinBoardServiceApi.getVotes("eleccion", 0, 10);

    expect(sent[0].url).toContain("/api/bulletin-board/elections/eleccion/votes");
    expect(sent[0].headers.has("Authorization")).toBe(false);
  });

  it("consulta la clave pública de autorización sin el token del usuario", async () => {
    const sent = captureRequests();

    await authorizationServiceApi.getPublicKey("eleccion");

    expect(sent[0].url).toContain("/api/authorization-service/elections/eleccion/keys/public");
    expect(sent[0].headers.has("Authorization")).toBe(false);
  });
});
