import Elysia from "elysia";
import {createLocalUserDAO} from "../models/dao/LocalUser.dao";
import createAuthService from "../services/auth.service";
import createEncryptionService from "../services/encryption.service";
import {
    LoginUserBody,
    LoginUserBodySchema,
    RegistrationUserBody,
    RegistrationUserBodySchema
} from '@sonsenim/contracts';
import unwrapBody from "../helpers/unwrapBody";

export const authRoutes = new Elysia({
    prefix: "/auth"
})
    .derive(({db}) => {
        return {
            authService: createAuthService({
                userDAO: createLocalUserDAO(db),
                encryptionService: createEncryptionService({
                    iterations: 100,
                    saltLength: 16,
                })
            })
        };
    })
    .post('/register', async ({body, authService}) => {
        const unwrappedBody= await unwrapBody<RegistrationUserBody>(body)
        return authService.registerUser(unwrappedBody);
    }, {
        body: RegistrationUserBodySchema,
        transform({body}) {
            body.email &&= body.email.toLowerCase();
            body.username &&= body.username.toLowerCase();
        }
    })

    // @ts-ignore #TODO: Add jwt accessor type
    .post('/login', async ({body, jwt, cookie: {auth}, authService}) => {
        const unwrappedBody= await unwrapBody<LoginUserBody>(body)
        const {token} = await authService.loginUser(unwrappedBody, jwt);


        auth!.set({
            value: token,
            httpOnly: true,
            secure: true,
            sameSite: 'none', // disabled for cloudflare (without sameOrigin proxy)
            path: '/',
            maxAge: 60 ** 3 * 15 // #TODO: Change later
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
            sameSite: 'none', // disabled for cloudflare (without sameOrigin proxy)
            path: '/',
            maxAge: 0
        })
    })
