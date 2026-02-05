import {LocalUserDAO} from "../models/dao/LocalUser.dao";



export const createUserService = (deps: {
    userDAO: typeof LocalUserDAO
}) => {
    const {userDAO} = deps;

    async function getUserInfo(id: number) {
        return await userDAO.findById(id);
    }

    return {getUserInfo}
}