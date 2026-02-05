import {Elysia} from "elysia";
import jwt from "@elysiajs/jwt";


const jwtPlugin = (app: Elysia) => {
    return app.use(
        jwt({name: 'jwt', secret: 'supersecret', exp: '15m'})
    )
};

export default jwtPlugin;