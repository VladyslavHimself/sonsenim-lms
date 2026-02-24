import Elysia, {status} from "elysia";
import {createLocalUserDAO} from "../models/dao/LocalUser.dao";
import createAuthService from "../services/auth/auth.service";
import createEncryptionService from "../services/encryption.service";
import {
    LoginUserBody,
    LoginUserBodySchema,
    RegistrationUserBody,
    RegistrationUserBodySchema
} from '@sonsenim/contracts';
import unwrapBody from "../helpers/unwrapBody";
import createAuthRepository from "../repositories/auth.repository";

export const authRoutes = new Elysia({
    prefix: "/auth"
})
    .derive(({db}) => {
        const encryptionService = createEncryptionService({
            iterations: 100,
            saltLength: 16,
        });

        return {
            authService: createAuthService({
                userDAO: createLocalUserDAO(db),
                encryptionService: encryptionService,
                authRepository: createAuthRepository({db})
            })
        };
    })
    .post('/register', async ({body, authService}) => {
        const unwrappedBody = await unwrapBody<RegistrationUserBody>(body)
        return authService.registerUser(unwrappedBody);
    }, {
        body: RegistrationUserBodySchema,
    })

    // @ts-ignore #TODO: Add jwt accessor type
    .post('/login', async ({body, jwt, cookie: {auth, refresh}, authService}) => {
        const unwrappedBody = await unwrapBody<LoginUserBody>(body)
        const {accessToken, refreshToken} = await authService.loginUser(unwrappedBody, jwt);

        const MIN_15= 15 * 60;
        const DAYS_30 = 30 * 24 * 60 * 60;

        auth!.set({
            value: accessToken,
            httpOnly: true,
            secure: true,
            sameSite: 'none', // disabled for cloudflare (without sameOrigin proxy)
            path: '/',
            maxAge: MIN_15
        });

        refresh!.set({
            value: refreshToken,
            httpOnly: true,
            secure: true,
            sameSite: 'none', // disabled for cloudflare (without sameOrigin proxy)
            path: '/',
            maxAge: DAYS_30
        })

        return {ok: true}
    }, {
        body: LoginUserBodySchema
    })

    .get('/refresh', async ({jwt, cookie: {auth, refresh}, authService}) => {
        // const MIN_15 = 60 ** 3 * 15;
        const MIN_15 = 15 * 60;
        const newAccessToken = await authService.renewAccessToken(refresh!.value as string, jwt);

        if (newAccessToken === null) {
            auth!.set({
                value: '',
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
                maxAge: 0
            })

            refresh!.set({
                value: '',
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
                maxAge: 0
            })

            return status(401, 'Unauthenticated');
        }

        auth!.set({
            value: newAccessToken,
            httpOnly: true,
            secure: true,
            sameSite: 'none', // disabled for cloudflare (without sameOrigin proxy)
            path: '/',
            maxAge: MIN_15
        });

    })

    .get('/logout', async ({cookie: {auth, refresh}, authService}) => {
        await authService.clearRefreshToken(refresh!.value as string);
        auth!.set({
            value: '',
            httpOnly: true,
            secure: true,
            sameSite: 'none', // disabled for cloudflare (without sameOrigin proxy)
            path: '/',
            maxAge: 0
        })

        refresh!.set({
            value: '',
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 0
        })

    })
