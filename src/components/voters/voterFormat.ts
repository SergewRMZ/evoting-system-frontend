import type { VoterRegistration } from "../../services/authentication-service/voters.types";

export const fullNameOf = (registration: Pick<VoterRegistration, "firstName" | "lastName">) =>
  [registration.firstName, registration.lastName].filter(Boolean).join(" ");

export const formatDateTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
    : "—";
