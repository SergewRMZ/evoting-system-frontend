
import { useContext } from "react";
import { KeycloakContext } from "./KeycloakContext";

export function useKeycloak() {
  const context = useContext(KeycloakContext);
   if (!context) {
    throw new Error(
      "useKeycloak debe utilizarse dentro de KeycloakProvider"
    );
  }

  return context;
}