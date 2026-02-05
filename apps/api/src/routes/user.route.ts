import {Elysia} from "elysia";
import {createUserService} from "../services/user.service";
import {LocalUserDAO} from "../models/dao/LocalUser.dao";


const UserService = createUserService({
    userDAO: LocalUserDAO
});

export const userRoutes = new Elysia({
    name: 'userRoute',
    prefix: '/user'
}).get('/me', async ({jwt, status, cookie: {auth}}) => {
    const payload = await jwt.verify(auth!.value);
    if (!payload) return status(401, 'Unauthorized');

    const user = await UserService.getUserInfo(payload.sub);

    return {
        id: user.id,
        username: user.username,
    };

})