import axios from 'axios';
import {LoginUserBody, RegistrationUserBody} from '@sonsenim/contracts';

export const AuthApi = {

    loginUser(loginBody: LoginUserBody) {
        return axios.post(`/api/auth/login`, loginBody);
    },

    registerUser(credentials: RegistrationUserBody) {
        return axios.post('/api/auth/register', credentials)
    },

    logoutUser() {
        return axios.get('/api/auth/logout');
    }
}