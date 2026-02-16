import {useNavigate} from "react-router-dom";
import {useAuth} from "@/security/AuthProvider.tsx";
import {useEffect} from "react";

export function RootResolver() {
    const {userInfo} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (userInfo?.id) {
            navigate('/dashboard');
        } else {
            navigate('/signIn');
        }
    }, [navigate]);

    return <></>;
}