import {LocalUserPersistence} from "../models/persistence/LocalUser.persistence";
import {LocalUser} from "../models/domain/LocalUser.model";

function getBaseUserFields(user: LocalUserPersistence): LocalUser {
    return {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        password: user.password,
        email: user.email,
        createdAt: user.created_at as unknown as string,
        updatedAt: user.updated_at as unknown as string,
    }
}

export const localUserMapper = {
    toLocalUser(user: LocalUserPersistence ) {
        return getBaseUserFields(user);
    }
}