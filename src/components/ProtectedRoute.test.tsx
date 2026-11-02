import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { useKeycloak } from "../auth/useKeycloak";

vi.mock("../auth/useKeycloak", () => ({ useKeycloak: vi.fn() }));

const session = (authenticated: boolean, roles: string[]) =>
  vi.mocked(useKeycloak).mockReturnValue({ authenticated, roles, loading: false } as never);

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>login</p>} />
        <Route path="/pending" element={<p>pendiente</p>} />
        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_AUTHORITY", "ROLE_VOTER"]} />}>
          <Route path="/vote" element={<p>elecciones</p>} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
          <Route path="/admin/voters" element={<p>votantes</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  it("envía a iniciar sesión a quien no está autenticado", () => {
    session(false, []);
    renderAt("/vote");
    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("envía a la página de revisión a una cuenta sin rol, sin entrar en bucle", () => {
    session(true, ["offline_access"]);
    renderAt("/vote");
    expect(screen.getByText("pendiente")).toBeInTheDocument();
  });

  it("un votante no puede abrir el panel de votantes y vuelve a su inicio", () => {
    session(true, ["ROLE_VOTER"]);
    renderAt("/admin/voters");
    expect(screen.getByText("elecciones")).toBeInTheDocument();
  });

  it("permite el acceso con el rol requerido", () => {
    session(true, ["ROLE_ADMIN"]);
    renderAt("/admin/voters");
    expect(screen.getByText("votantes")).toBeInTheDocument();
  });
});
