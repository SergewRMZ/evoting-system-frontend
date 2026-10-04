import { useKeycloak } from "../auth/useKeycloak";
import { Navigate, Outlet } from "react-router-dom";
import LoadingPage from "./LoadingPage";

type ProtectedRouteProps = {
    // children: React.ReactNode;
    redirectTo?: string;
};

export const ProtectedRoute = ({ redirectTo = "/" }: ProtectedRouteProps) => {
    const { authenticated, loading } = useKeycloak();

    if(loading) {
        return <LoadingPage/>
    }

    if(!authenticated) {
        return <Navigate to={redirectTo} replace />;
    }
    return <Outlet />;
}