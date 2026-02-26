import {Elysia} from "elysia";
import {createUserService} from "../services/user.service";
import {createLocalUserDAO} from "../models/dao/LocalUser.dao";
import {createDecksService} from "../services/decks.service";
import createDecksRepository from "../repositories/decks.repository";
import createCardsService from "../services/cards/cards.service";
import createCardsRepository from "../repositories/cards.repository";
import {createCardsDAO} from "../models/dao/cards.dao";
import {deckMapper} from "../mappers/deck.mapper";
import {createDecksDAO} from "../models/dao/decks.dao";
import createGroupsRepository from "../repositories/groups.repository";
import {createGroupsDAO} from "../models/dao/Groups.dao";
import {userInfoResponseDtoMapper} from "../models/dto/userInfoResponseDto.mapper";


export const userRoutes = new Elysia({
    name: 'userRoute',
    prefix: '/user'
})
    .derive(({db}) => {
        const DecksRepository = createDecksRepository({
            db: db,
            deckMapper: deckMapper, decksDAO: createDecksDAO(db)
        });

        const CardsRepository = createCardsRepository({
            decksRepository: DecksRepository,
            cardsDAO: createCardsDAO(db),
            db
        });

        const GroupsRepository = createGroupsRepository({
            groupsDAO: createGroupsDAO(db),
            db
        });

        const UserService = createUserService({
            userDAO: createLocalUserDAO(db)
        });

        const CardsService = createCardsService({
            cardsRepository: CardsRepository
        });

        const DecksService = createDecksService({
            decksRepository: DecksRepository,
            groupsRepository: GroupsRepository,
        });

        return {
            userService: UserService,
            cardsService: CardsService,
            decksService: DecksService,
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

    .get('/info', async ({userService, cardsService, decksService, jwt, cookie: {auth}}) => {
        const {sub} = await jwt.verify(auth!.value) || {};
        const user = await userService.getUserInfo(sub);

        const decksTotal = await decksService.getUserDecksTotal(user.id);
        const cardsTotal = await cardsService.getUserCardsTotal(user.id);

        return userInfoResponseDtoMapper.toDTO(user, decksTotal, cardsTotal);
    })