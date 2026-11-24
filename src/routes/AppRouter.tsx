import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../pages/HomePage.tsx";
import LoginPage from "../pages/LoginPage.tsx";
import ElectionsPage from "../pages/ElectionsPage.tsx";
import VotePage from "../pages/VotePage.tsx";
import ElectionDetailsPage from "../pages/ElectionDetailsPage.tsx";
import BulletinBoardPage from "../pages/BulletinBoardPage.tsx";
import AdminDashboardPage from "../pages/AdminDashboardPage.tsx";
import ElectionConfigurationPage from "../pages/ElectionConfigurationPage.tsx";
import ElectionResultsPage from "../pages/ElectionResultsPage.tsx";
import AdminVotersPage from "../pages/AdminVotersPage.tsx";
import PendingAccountPage from "../pages/PendingAccountPage.tsx";
import { ProtectedRoute } from "../components/ProtectedRoute.tsx";
import { useKeycloak } from "../auth/useKeycloak.ts";
import { getHomePath } from "../auth/roles.ts";

/** Destino tras iniciar sesión o registrarse: la página que corresponde al rol. */
function StartRedirect() {
  const { authenticated, roles } = useKeycloak();
  return <Navigate to={authenticated ? getHomePath(roles) : "/login"} replace />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/start" element={<StartRedirect />} />

        {/* Tablón público: cualquiera puede auditar los votos, sin iniciar sesión */}
        <Route path="/vote/:electionId/bulletin" element={<BulletinBoardPage />} />

        {/* Cuenta autenticada pero aún no aprobada */}
        <Route element={<ProtectedRoute />}>
          <Route path="/pending" element={<PendingAccountPage />} />
        </Route>

        {/* Rutas accesibles por cualquier rol autenticado */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ROLE_ADMIN", "ROLE_AUTHORITY", "ROLE_VOTER"]}
            />
          }
        >
          <Route path="/vote" element={<ElectionsPage />} />
          <Route path="/vote/:electionId" element={<ElectionDetailsPage />} />
          {/* Resultados finales: accesibles para todos los roles, controlado en la vista */}
          <Route path="/vote/:electionId/results" element={<ElectionResultsPage />} />
        </Route>

        {/* Ruta de emisión de voto: EXCLUSIVA para ROLE_VOTER */}
        <Route element={<ProtectedRoute allowedRoles={["ROLE_VOTER"]} />}>
          <Route path="/vote/:electionId/ballot" element={<VotePage />} />
        </Route>

        {/* Rutas de autoridad */}
        <Route element={<ProtectedRoute allowedRoles={["ROLE_AUTHORITY"]} />}>
          <Route path="/authority" element={<ElectionsPage />} />
        </Route>

        {/* Rutas de administrador */}
        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/voters" element={<AdminVotersPage />} />
          <Route path="/admin/elections/:electionId" element={<ElectionConfigurationPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
