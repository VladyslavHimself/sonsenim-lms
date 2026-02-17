import axios from "axios";

export const axiosInstances = axios.create({
    withCredentials: true
});

export const authInstance = axios.create({
    withCredentials: true,
    baseURL: import.meta.env.VITE_AUTH_API_URL
});
