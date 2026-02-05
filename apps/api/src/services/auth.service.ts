import {LocalUserDAO} from "../models/dao/LocalUser.dao";
import createEncryptionService from "./encryption.service";
import {AuthError} from "../exceptions/AuthException";
import type {LoginUserBody, RegistrationUserBody} from "@sonsenim/contracts";

export default function createAuthService(deps: {
    userDAO: typeof LocalUserDAO,
    encryptionService: ReturnType<typeof createEncryptionService>
}) {
    const {userDAO, encryptionService} = deps;

    async function registerUser(body: RegistrationUserBody) {
        const {email, username} = body;
        if (await isEmailExists(email)) throw new AuthError("Email already exists", 409);
        if (await isUsernameExists(username)) throw new AuthError("Username already exists", 409);
        const newUser = {...body, password: await encryptionService.encryptPassword(body.password)};
        return userDAO.save(newUser);
    }

    async function loginUser(body: LoginUserBody, jwt: any) {

        const {username, password} = body;
        const user = await userDAO.findByUsername(username);
        if (!user.length) throw new AuthError("User not found", 404);
        const isPasswordValid = await encryptionService.verifyPassword(user[0].password, password);
        if (!isPasswordValid) throw new AuthError("Invalid password", 401);

        const token = await jwt.sign({
            sub: user[0].id,
            username
        });

        return { token }
    }

    async function isEmailExists(email: string) {
        const data = await userDAO.findByEmail(email);
        return data.length > 0;
    }

    async function isUsernameExists(username: string) {
        const data = await userDAO.findByUsername(username);
        return data.length > 0;
    }

    return {registerUser, loginUser}
}
