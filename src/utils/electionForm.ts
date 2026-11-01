export type ElectionFormValues = {
  name: string;
  description: string;
  /** Valores de `<input type="datetime-local">` (hora local, sin zona). */
  startDate: string;
  endDate: string;
};

export type ElectionFormErrors = Partial<Record<keyof ElectionFormValues, string>>;

export const emptyElectionForm: ElectionFormValues = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
};

const pad = (value: number) => String(value).padStart(2, "0");

/** ISO 8601 -> valor para `datetime-local` en la zona horaria del navegador. */
export const toDateTimeLocal = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const electionToFormValues = (election: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}): ElectionFormValues => ({
  name: election.name,
  description: election.description,
  startDate: toDateTimeLocal(election.startDate),
  endDate: toDateTimeLocal(election.endDate),
});

/**
 * Reglas equivalentes a las del backend (`CreateElectionDtoRequest` y
 * `UpdateElectionDtoRequest`): campos obligatorios, fechas futuras e inicio < fin.
 */
export function validateElectionForm(values: ElectionFormValues, now: Date = new Date()): ElectionFormErrors {
  const errors: ElectionFormErrors = {};
  const start = new Date(values.startDate);
  const end = new Date(values.endDate);
  const validStart = values.startDate !== "" && !Number.isNaN(start.getTime());
  const validEnd = values.endDate !== "" && !Number.isNaN(end.getTime());

  if (!values.name.trim()) errors.name = "Escribe el nombre de la elección.";
  if (!values.description.trim()) errors.description = "Escribe una descripción.";

  if (!validStart) errors.startDate = "Indica la fecha y hora de inicio.";
  else if (start <= now) errors.startDate = "La fecha de inicio debe ser futura.";

  if (!validEnd) errors.endDate = "Indica la fecha y hora de finalización.";
  else if (end <= now) errors.endDate = "La fecha de finalización debe ser futura.";
  else if (validStart && start >= end) errors.endDate = "La finalización debe ser posterior al inicio.";

  return errors;
}

export const hasFormErrors = (errors: ElectionFormErrors) => Object.keys(errors).length > 0;

export const isSameElectionForm = (a: ElectionFormValues, b: ElectionFormValues) =>
  a.name.trim() === b.name.trim() &&
  a.description.trim() === b.description.trim() &&
  a.startDate === b.startDate &&
  a.endDate === b.endDate;

/** Valores del formulario -> cuerpo de la solicitud (fechas en ISO 8601 UTC). */
export const toElectionRequest = (values: ElectionFormValues) => ({
  name: values.name.trim(),
  description: values.description.trim(),
  startDate: new Date(values.startDate).toISOString(),
  endDate: new Date(values.endDate).toISOString(),
});
