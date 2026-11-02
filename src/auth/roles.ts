export const APP_ROLES = ["ROLE_ADMIN", "ROLE_AUTHORITY", "ROLE_VOTER"] as const;
export type AppRole = (typeof APP_ROLES)[number];

/** Una cuenta sin ninguno de los roles de la aplicación está pendiente de aprobación. */
export const hasAppRole = (roles: string[]) => roles.some((role) => (APP_ROLES as readonly string[]).includes(role));

/** Página de inicio de cada usuario según su rol de mayor privilegio. */
export function getHomePath(roles: string[]): string {
  if (roles.includes("ROLE_ADMIN")) return "/admin";
  if (roles.includes("ROLE_AUTHORITY")) return "/authority";
  if (roles.includes("ROLE_VOTER")) return "/vote";
  return "/pending";
}
