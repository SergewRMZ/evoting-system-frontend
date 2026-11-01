import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useElectionOperation from "./useElectionOperation";
import type { StepDefinition } from "../../services/election-service/election-lifecycle";

describe("useElectionOperation", () => {
  it("ignora una segunda ejecución mientras la primera sigue en curso", async () => {
    let release: () => void = () => undefined;
    const run = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    const definitions: StepDefinition[] = [{ id: "s", label: "Paso", errorContext: "election", run }];
    const { result } = renderHook(() => useElectionOperation());

    let first: Promise<boolean> = Promise.resolve(false);
    let second = true;
    await act(async () => {
      first = result.current.run(definitions);
      second = await result.current.run(definitions);
    });

    expect(second).toBe(false);
    expect(result.current.phase).toBe("running");

    await act(async () => {
      release();
      await first;
    });

    expect(run).toHaveBeenCalledTimes(1);
    expect(result.current.phase).toBe("success");
  });

  it("pasa a error cuando un paso falla y permite reanudar", async () => {
    const run = vi.fn().mockRejectedValueOnce(new Error("falló")).mockResolvedValueOnce(undefined);
    const definitions: StepDefinition[] = [{ id: "s", label: "Paso", errorContext: "generic", run }];
    const { result } = renderHook(() => useElectionOperation());

    await act(async () => { await result.current.run(definitions); });
    expect(result.current.phase).toBe("error");
    expect(result.current.steps[0].status).toBe("error");

    await act(async () => { await result.current.run(definitions); });
    expect(result.current.phase).toBe("success");
    expect(run).toHaveBeenCalledTimes(2);
  });
});
