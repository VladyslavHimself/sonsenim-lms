import {createLocalUserDAO} from "../models/dao/LocalUser.dao";
import {localUserMapper} from "../mappers/localUser.mapper";
import {LocalUser} from "../models/domain/LocalUser.model";



export const createUserService = (deps: {
    userDAO: ReturnType<typeof createLocalUserDAO>
}) => {
    const {userDAO} = deps;

    async function getUserInfo(id: string): Promise<LocalUser> {
        const user = await userDAO.findById(id);

        return localUserMapper.toLocalUser(user);
    }

    return {getUserInfo}
}