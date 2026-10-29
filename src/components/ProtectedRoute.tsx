import { useKeycloak } from "../auth/useKeycloak";
import { Navigate, Outlet } from "react-router-dom";
import LoadingPage from "./LoadingPage";

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
    if (allowedRoles && !allowedRoles.some((role) => roles.includes(role))) {
        return <Navigate to="/vote" replace />;
    }
    return <Outlet />;
}