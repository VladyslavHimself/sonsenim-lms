import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import useUserInfo from "@/api/user/useUserInfo.ts";
import {UserInfoResponse} from "@/api/user/user.ts";


const AuthContext = createContext({} as AuthContext);

type Props = {
    children: ReactNode,
}

type AuthContext = {
    userInfo: UserInfoResponse | null,
    setUserInfo: React.Dispatch<React.SetStateAction<UserInfoResponse | null>>,
    isLoading: boolean,
}


export function AuthProvider({children}: Props) {
    const {userInfo: userInfoQuery = null, isLoading} = useUserInfo();
    const [userInfo, setUserInfo] = useState<UserInfoResponse|null>(userInfoQuery);
    useEffect(() => {
        setUserInfo(userInfoQuery);
    }, [userInfoQuery]);

    return <AuthContext.Provider value={{userInfo, setUserInfo, isLoading}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    // @ts-ignore
    const context = useContext<AuthContext>(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}