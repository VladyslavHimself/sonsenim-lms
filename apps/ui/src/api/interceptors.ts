import {authInstance, axiosInstances} from "@/api/axiosInstances.ts";
import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {AxiosError, AxiosRequestConfig} from "axios";

let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
    if (!refreshPromise) {
        refreshPromise = authInstance.get(`${RESOURCE_SERVER_URL}/api/auth/refresh`)
            .then(() => {
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}


axiosInstances.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
        const status = err.response?.status;
        const original = err.config as (AxiosRequestConfig & { _retry?: boolean });

        if (!original || status !== 401) throw err;

        const url = original.url ?? "";
        if (url.includes("/auth/refresh")) throw err;

        if (original._retry) throw err;
        original._retry = true;

        try {
            await refreshSession();
            return axiosInstances.request(original);
        } catch (refreshErr) {
            // TODO: Investigate why refreshSession is called in sign-in & sign-up pathes
            if (window.location.pathname.includes('signIn') || window.location.pathname.includes('signUp')) {
                return;
            }

            window.location.replace('/signIn');
            throw refreshErr;
        }
    }
);