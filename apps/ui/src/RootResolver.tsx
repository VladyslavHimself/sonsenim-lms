import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

export function RootResolver() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        } else {
            navigate('/signIn');
        }
    }, [navigate]);
    return <></>;
}