import {Elysia} from "elysia";
import {createUserService} from "../services/user.service";
import {createLocalUserDAO} from "../models/dao/LocalUser.dao";

export const userRoutes = new Elysia({
    name: 'userRoute',
    prefix: '/user'
})
    .derive(({ db }) => {
        return {
            userService: createUserService({
                userDAO: createLocalUserDAO(db)
            })
        };
    })
    .get('/me', async ({jwt, status, cookie: {auth}, userService}) => {
    const payload = await jwt.verify(auth!.value);
    if (!payload) return status(401, 'Unauthorized');

    const user = await userService.getUserInfo(payload.sub);

    return {
        id: user.id,
        username: user.username,
    };

})