import {PropsWithChildren} from "react";
import {useAuth} from "./AuthProvider.tsx";
import {Navigate} from "react-router-dom";

export default function ProtectedRoute({children}: PropsWithChildren) {
    const {userInfo, isLoading} = useAuth();

    if (!isLoading && !userInfo?.id) return <Navigate to={'/signIn'} replace />

    return children;
}