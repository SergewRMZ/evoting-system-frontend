import type {
  Candidate,
  Election,
  ElectionPosition,
} from "./electionTypes";

const ELECTION_STATUSES = new Set<string>([
  "CREATED",
  "VERIFIED",
  "ACTIVE",
  "CLOSED",
  "FINISHED",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(
      value,
    ) &&
    Number.isFinite(Date.parse(value))
  );
}

function isCandidate(value: unknown): value is Candidate {
  return (
    isRecord(value) &&
    isUuid(value.candidateId) &&
    typeof value.name === "string" &&
    typeof value.lastName === "string" &&
    typeof value.description === "string" &&
    typeof value.isActive === "boolean" &&
    isIsoDate(value.createdAt) &&
    isIsoDate(value.updatedAt)
  );
}

function isElectionPosition(value: unknown): value is ElectionPosition {
  return (
    isRecord(value) &&
    isUuid(value.electionPositionId) &&
    isUuid(value.positionId) &&
    typeof value.positionName === "string" &&
    Array.isArray(value.candidates) &&
    value.candidates.every(isCandidate)
  );
}

export function isElection(value: unknown): value is Election {
  return (
    isRecord(value) &&
    isUuid(value.electionId) &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    isIsoDate(value.startDate) &&
    isIsoDate(value.endDate) &&
    typeof value.status === "string" &&
    ELECTION_STATUSES.has(value.status) &&
    Array.isArray(value.positions) &&
    value.positions.every(isElectionPosition)
  );
}
