import { describe, expect, it } from "vitest";
import { KEY_STATUS_META, electionHasKeys, truncateMiddle } from "./keyStatus";

describe("truncateMiddle", () => {
  it("abrevia una cadena larga conservando el inicio y el final", () => {
    const value = `${"a".repeat(16)}${"x".repeat(300)}${"z".repeat(12)}`;
    expect(truncateMiddle(value)).toBe(`${"a".repeat(16)}…${"z".repeat(12)}`);
  });

  it("no altera una cadena corta", () => {
    expect(truncateMiddle("AQAB")).toBe("AQAB");
  });
});

describe("estados de clave", () => {
  it("asigna un color distinto a cada estado", () => {
    const colors = Object.values(KEY_STATUS_META).map((meta) => meta.color);
    expect(colors).toHaveLength(3);
    expect(new Set(colors).size).toBe(3);
  });

  it("solo hay claves a partir de la validación", () => {
    expect(electionHasKeys("DRAFT")).toBe(false);
    expect(electionHasKeys("PUBLISHED")).toBe(false);
    expect(electionHasKeys("VERIFIED")).toBe(true);
    expect(electionHasKeys("FINISHED")).toBe(true);
  });
});
