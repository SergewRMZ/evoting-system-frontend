export type ElectionStatus =
  | "CREATED"
  | "VERIFIED"
  | "PUBLISHED"
  | "ACTIVE"
  | "CLOSED"
  | "FINISHED";

export type Candidate = {
  candidateId: string;
  name: string;
  lastName: string;
  description: string;
  isActive: boolean;
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
