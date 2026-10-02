export type ElectionStatus =
  | "CREATED"
  | "VERIFIED"
  | "ACTIVE"
  | "CLOSED"
  | "FINISHED";

export type Candidate = {
  candidateId: string;
  name: string;
  lastName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ElectionPosition = {
  electionPositionId: string;
  positionId: string;
  positionName: string;
  candidates: Candidate[];
};

export type Election = {
  electionId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ElectionStatus;
  positions: ElectionPosition[];
};
