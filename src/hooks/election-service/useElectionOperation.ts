import { useCallback, useRef, useState } from "react";
import {
  executeSteps,
  toInitialSteps,
  type OperationStep,
  type StepDefinition,
} from "../../services/election-service/election-lifecycle";

export type OperationPhase = "idle" | "running" | "success" | "error";

/**
 * Ejecuta una operación de varios pasos (validación o activación) exponiendo su
 * progreso. Una referencia síncrona impide lanzar la operación dos veces aunque
 * el usuario haga doble clic antes de que React deshabilite el botón.
 */
const useElectionOperation = () => {
  const [phase, setPhase] = useState<OperationPhase>("idle");
  const [steps, setSteps] = useState<OperationStep[]>([]);
  const runningRef = useRef(false);
  const stepsRef = useRef<OperationStep[]>([]);

  const updateSteps = useCallback((next: OperationStep[]) => {
    stepsRef.current = next;
    setSteps(next);
  }, []);

  /** Ejecuta la operación; si hay pasos previos resueltos, continúa solo con los pendientes. */
  const run = useCallback(
    async (definitions: StepDefinition[]) => {
      if (runningRef.current) return false;
      runningRef.current = true;
      setPhase("running");

      const hasPreviousRun = stepsRef.current.length === definitions.length;
      const initial = hasPreviousRun ? stepsRef.current : toInitialSteps(definitions);
      updateSteps(initial);

      try {
        const completed = await executeSteps(definitions, initial, updateSteps);
        setPhase(completed ? "success" : "error");
        return completed;
      } finally {
        runningRef.current = false;
      }
    },
    [updateSteps],
  );

  const reset = useCallback(() => {
    if (runningRef.current) return;
    stepsRef.current = [];
    setSteps([]);
    setPhase("idle");
  }, []);

  return { phase, steps, run, reset, isRunning: phase === "running" };
};

export default useElectionOperation;
