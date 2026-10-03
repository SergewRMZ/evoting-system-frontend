import type { Election } from "./electionTypes";

export type ElectionOverview = Pick<
  Election,
  "electionId" | "name" | "startDate" | "endDate" | "status"
>;

const sampleCandidates = [
  {
    candidateId: "e2514729-40b1-421b-9ecc-91e250c93203",
    name: "Juan Manuel",
    lastName: "Jímenez López",
    description: "Description 1",
    isActive: true,
    createdAt: "2026-10-03T18:11:47.347886Z",
    updatedAt: "2026-10-03T18:11:47.347886Z",
  },
  {
    candidateId: "12bb34cb-a602-4a93-85f7-422748e16e92",
    name: "Marco Bernardo",
    lastName: "Oleas Calles",
    description: "Description 2",
    isActive: true,
    createdAt: "2026-10-03T18:11:47.347886Z",
    updatedAt: "2026-10-03T18:11:47.347886Z",
  },
];

export const electionDetails: Election[] = [
  {
    electionId: "34b689a2-c4ec-4bb2-8dc6-90c6fe398879",
    name: "Elección general para pruebas",
    description:
      "Esta es una elección interna configurada para realizar testing de la aplicación.",
    startDate: "2026-10-01T12:00:00Z",
    endDate: "2026-10-02T12:00:00Z",
    status: "ACTIVE",
    positions: [
      {
        electionPositionId: "9ce8e923-7b21-4c6a-9a3c-fcd3ea7bc0fc",
        positionId: "137c8660-c905-4644-a366-797f803076c7",
        positionName: "Alumno Consejero",
        candidates: sampleCandidates,
      },
      {
        electionPositionId: "4e25bb14-22ce-4d22-b905-948b072e17fb",
        positionId: "a3e40601-3913-4852-8eff-af46020207ac",
        positionName: "Docente Consejero",
        candidates: sampleCandidates,
      },
    ],
  },
];

export const elections: ElectionOverview[] = electionDetails.map(
  ({ electionId, name, startDate, endDate, status }) => ({
    electionId,
    name,
    startDate,
    endDate,
    status,
  }),
);

export function getElectionDetails(electionId: string) {
  return electionDetails.find((election) => election.electionId === electionId);
}
