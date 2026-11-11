import type { ElectionPosition } from "../services/election-service/election.types";
import type { ElectionTallyResult } from "../services/tally-service/tally-service.types";

export type CandidateResult = {
  candidacyId: string;
  name: string;
  candidateId: string;
  hasPhoto: boolean;
  votes: number;
};

/** Resultados de un cargo en el orden de la boleta, con el total y los ganadores. */
export function summarizePosition(position: ElectionPosition, results: ElectionTallyResult[]) {
  const candidates: CandidateResult[] = position.candidacies.map((candidacy) => ({
    candidacyId: candidacy.candidacyId,
    name: `${candidacy.candidate.name} ${candidacy.candidate.lastName}`.trim(),
    candidateId: candidacy.candidate.id,
    hasPhoto: candidacy.candidate.hasPhoto,
    votes:
      results.find(
        (r) =>
          r.candidacyId === candidacy.candidacyId &&
          r.electionPositionId === position.electionPositionId,
      )?.result ?? 0,
  }));
  const total = candidates.reduce((sum, c) => sum + c.votes, 0);
  const max = Math.max(0, ...candidates.map((c) => c.votes));
  // Sin votos no hay ganador; con varios en el máximo es empate.
  const winners = new Set(max > 0 ? candidates.filter((c) => c.votes === max).map((c) => c.candidacyId) : []);
  return { candidates, total, winners };
}
