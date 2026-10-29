import { createContext } from "react";

export type ColorMode = "dark" | "light";

export const ColorModeContext = createContext<{
  mode: ColorMode;
  toggleColorMode: () => void;
}>({
  mode: "dark",
  toggleColorMode: () => undefined,
});
