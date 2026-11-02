import { describe, expect, it } from "vitest";
import { getHomePath, hasAppRole } from "./roles";

describe("roles", () => {
  it("una cuenta sin roles de la aplicación está pendiente", () => {
    expect(hasAppRole([])).toBe(false);
    expect(hasAppRole(["default-roles-voting-system-realm", "offline_access"])).toBe(false);
    expect(hasAppRole(["ROLE_VOTER"])).toBe(true);
  });

  it("dirige a cada usuario a su página según el rol de mayor privilegio", () => {
    expect(getHomePath(["ROLE_VOTER", "ROLE_ADMIN"])).toBe("/admin");
    expect(getHomePath(["ROLE_AUTHORITY"])).toBe("/authority");
    expect(getHomePath(["ROLE_VOTER"])).toBe("/vote");
    expect(getHomePath(["offline_access"])).toBe("/pending");
  });
});
