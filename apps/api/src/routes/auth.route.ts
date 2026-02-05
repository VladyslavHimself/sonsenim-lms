import Elysia from "elysia";
import {LocalUserDAO} from "../models/dao/LocalUser.dao";
import createAuthService from "../services/auth.service";
import createEncryptionService from "../services/encryption.service";
import {AuthError} from "../exceptions/AuthException";
import {LoginUserBodySchema, RegistrationUserBodySchema} from '@sonsenim/contracts';

const EncryptionService = createEncryptionService({
    timeCost: 3,
    memoryCost: 64 * 1024,
    parallelism: 1
});

const AuthService = createAuthService({
    userDAO: LocalUserDAO,
    encryptionService: EncryptionService
});

export const authRoutes = new Elysia({
    prefix: "/auth"
})
    .post('/register', async ({body}) => {
        return AuthService.registerUser(body);
    }, {
        body: RegistrationUserBodySchema,
        transform({body}) {
            body.email &&= body.email.toLowerCase();
            body.username &&= body.username.toLowerCase();
        }
    })

    // @ts-ignore #TODO: Add jwt accessor type
    .post('/login', async ({body, jwt, cookie: {auth}}) => {
        const {token} = await AuthService.loginUser(body, jwt);
        const MIN_15 = 60 * 15;


        auth!.set({
            value: token,
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            // TODO: For dev purposes only
            maxAge: 60 ** 3 * 15
        })

        return {ok: true}
    }, {
        body: LoginUserBodySchema
    })

    .get('/logout', async ({cookie: {auth}}) => {
        auth!.set({
            value: '',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 0
        })
    })

    // @ts-ignore
    .error(({error}) => {
        if (error instanceof AuthError) return new Response(error.message, {status: error.status});
        return new Response('Internal Server Error', {status: 500});
    })
