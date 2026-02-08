import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {axiosInstance} from "@/api/axiosInstance.ts";


export type UserProfileResponse = {
    id: number,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    createdAt: string,
    totalDecks: number,
    totalCards: number,
}

export type UserInfoResponse = {
    id: number,
    username: string,
}


const UserApi = {
    getLoggedInUserProfile() {
        return axiosInstance.get<UserProfileResponse>(`${RESOURCE_SERVER_URL}/api/user-info/me`);
    },

    getUserInfo() {
        return axiosInstance.get<UserInfoResponse>(`${RESOURCE_SERVER_URL}/api/user/me`);
    }
}

export default UserApi;