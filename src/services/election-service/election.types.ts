export type ElectionStatus =
  | "DRAFT"
  | "CREATED"
  | "VERIFIED"
  | "PUBLISHED"
  | "ACTIVE"
  | "CLOSED"
  | "FINISHED";

export type Candidate = {
  id: string;
  name: string;
  lastName: string;
  description: string;
  isActive: boolean;
  hasPhoto: boolean;
}
export type Candidacy = {
  candidacyId: string;
  candidate: Candidate
};

export type ElectionPosition = {
  electionPositionId: string;
  positionId: string;
  positionName: string;
  candidacies: Candidacy[];
};

export type Election = {
  electionId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ElectionStatus;
};

export type ElectionDetails = Election & {
  positions: ElectionPosition[];
}

export type CreateElectionRequest = Pick<Election, "name" | "description" | "startDate" | "endDate">;

export type UpdateElectionRequest = CreateElectionRequest;

export type Position = {
  id: string;
  positionName: string;
};

export type CreateCandidateRequest = Pick<Candidate, "name" | "lastName" | "description">;

export type CreateElectionResponse = Pick<Election, "electionId" | "name" | "startDate" | "endDate" | "status">;

export type CreateCandidacyResponse = {
  id: string;
  candidateId: string;
  electionPositionId: string;
  createdAt: string;
};

export type AssociatePositionResponse = {
  id: string;
  electionId: string;
  positionId: string;
};
