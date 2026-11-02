import { useKeycloak } from "../auth/useKeycloak";
import { Navigate, Outlet } from "react-router-dom";
import LoadingPage from "./LoadingPage";
import { getHomePath, hasAppRole } from "../auth/roles";

type ProtectedRouteProps = {
    redirectTo?: string;
    allowedRoles?: string[];
};

export const ProtectedRoute = ({ redirectTo = "/login", allowedRoles }: ProtectedRouteProps) => {
    const { authenticated, loading, roles } = useKeycloak();

    if(loading) {
        return <LoadingPage/>
    }

    if(!authenticated) {
        return <Navigate to={redirectTo} replace />;
    }
    // Cuenta registrada pero aún no aprobada: no tiene acceso a ninguna sección.
    if (allowedRoles && !hasAppRole(roles)) {
        return <Navigate to="/pending" replace />;
    }
    if (allowedRoles && !allowedRoles.some((role) => roles.includes(role))) {
        return <Navigate to={getHomePath(roles)} replace />;
    }
    return <Outlet />;
}
