import {LoginUserBody, RegistrationUserBody} from '@sonsenim/contracts';
import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {authInstance, axiosInstances} from "@/api/axiosInstances.ts";

export const AuthApi = {

    loginUser(loginBody: LoginUserBody) {
        return axiosInstances.post(`${RESOURCE_SERVER_URL}/api/auth/login`, loginBody);
    },

    registerUser(credentials: RegistrationUserBody) {
        return axiosInstances.post(`${RESOURCE_SERVER_URL}/api/auth/register`, credentials)
    },

    logoutUser() {
        return axiosInstances.get(`${RESOURCE_SERVER_URL}/api/auth/logout`);
    },

    refreshToken() {
        return authInstance.get(`${RESOURCE_SERVER_URL}/api/auth/refresh`);
    },
}