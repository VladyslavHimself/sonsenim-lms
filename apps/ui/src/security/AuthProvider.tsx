import {createContext, ReactNode, useContext} from "react";
import useUserInfo from "@/api/user/useUserInfo.ts";
import {UserInfoResponse} from "@/api/user/user.ts";


const AuthContext = createContext({} as AuthContext);

type Props = {
    children: ReactNode,
}

type AuthContext = {
    userInfo: UserInfoResponse | null,
    isLoading: boolean,
}


export function AuthProvider({children}: Props) {
    const {userInfo: userInfoQuery = null, isLoading} = useUserInfo();

    if (isLoading) return <h1>Loading</h1>;

    return <AuthContext.Provider value={{userInfo: userInfoQuery, isLoading}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    // @ts-ignore
    const context = useContext<AuthContext>(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}