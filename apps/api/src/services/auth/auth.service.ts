import {createLocalUserDAO} from "../../models/dao/LocalUser.dao";
import createEncryptionService from "../encryption.service";
import {AuthError} from "../../exceptions/AuthException";
import type {LoginUserBody, RegistrationUserBody} from "@sonsenim/contracts";
import {generateRefreshToken, sha256} from "./auth.functions";
import createAuthRepository from "../../repositories/auth.repository";

export default function createAuthService(deps: {
    userDAO: ReturnType<typeof createLocalUserDAO>,
    encryptionService: ReturnType<typeof createEncryptionService>,
    authRepository: ReturnType<typeof createAuthRepository>
}) {
    const {userDAO, encryptionService, authRepository} = deps;

    async function registerUser(body: RegistrationUserBody) {
        const {email, username} = body;
        if (await _isEmailExists(email)) throw new AuthError("Email already exists", 409);
        if (await _isUsernameExists(username)) throw new AuthError("Username already exists", 409);
        const newUser = {...body, password: await encryptionService.encryptPassword(body.password)};
        return userDAO.save(newUser);
    }

    async function loginUser(body: LoginUserBody, jwt: any) {
        const {username, password} = body;
        const user = await userDAO.findByUsername(username);
        if (!user.length) throw new AuthError("User not found", 404);
        const isPasswordValid = await encryptionService.verifyPassword(password, user[0].password)
        // TODO: If status 401 - can't receive AxiosError; Investigate
        if (!isPasswordValid) throw new AuthError("Invalid password");

        const refreshToken = generateRefreshToken();
        const tokenHash = await sha256(refreshToken);
        await authRepository.saveRefreshToken(user[0].id, tokenHash);

        const accessToken = await _createAccessToken(jwt, user[0].id, username);

        return {accessToken, refreshToken}
    }

    async function renewAccessToken(refreshToken: string, jwt: any) {
        const hashedRefreshToken = await sha256(refreshToken);
        const metadata = await authRepository.findRefreshToken(hashedRefreshToken);

        if (!metadata || new Date(metadata.expires_at) < new Date()) {
            await authRepository.deleteRefreshToken(hashedRefreshToken);
            return null;
        }

        const user = await userDAO.findById(metadata.user_id);

        return _createAccessToken(jwt, user.id, user.username);
    }

    async function clearRefreshToken(refreshToken: string) {
        const hashedRefreshToken = await sha256(refreshToken);

        await authRepository.deleteRefreshToken(hashedRefreshToken);
    }


    async function _createAccessToken(jwt: any, userId: string, username: string) {
        return await jwt.sign({
            sub: userId,
            username
        })
    }

    async function _isEmailExists(email: string) {
        const data = await userDAO.findByEmail(email);
        return data.length > 0;
    }

    async function _isUsernameExists(username: string) {
        const data = await userDAO.findByUsername(username);
        return data.length > 0;
    }

    return {registerUser, loginUser, renewAccessToken, clearRefreshToken}
}
