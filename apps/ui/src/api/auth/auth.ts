import {LoginUserBody, RegistrationUserBody} from '@sonsenim/contracts';
import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {axiosInstance} from "@/api/axiosInstance.ts";

export const AuthApi = {

    loginUser(loginBody: LoginUserBody) {
        console.log(process.env)
        return axiosInstance.post(`${RESOURCE_SERVER_URL}/api/auth/login`, loginBody);
    },

    registerUser(credentials: RegistrationUserBody) {
        return axiosInstance.post(`${RESOURCE_SERVER_URL}/api/auth/register`, credentials)
    },

    logoutUser() {
        return axiosInstance.get(`${RESOURCE_SERVER_URL}/api/auth/logout`);
    }
}