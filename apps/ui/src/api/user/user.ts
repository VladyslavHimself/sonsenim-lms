import axios from "axios";


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
        return axios.get<UserProfileResponse>('/api/user-info/me');
    },

    getUserInfo() {
        return axios.get<UserInfoResponse>('/api/user/me');
    }
}

export default UserApi;