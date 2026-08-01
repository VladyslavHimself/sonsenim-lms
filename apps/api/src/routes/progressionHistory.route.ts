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
import createProgressionHistoryService from "../services/progressionHistory.service";
import createProgressionHistoryRepository from "../repositories/progressionHistory.repository";
import authHook from "../hooks/authHook";
import {createProgressionHistoryDAO} from "../models/dao/progressionHistory.dao";

export const progressionHistoryRoutes = new Elysia({
    name: 'progressstionHistory',
    prefix: '/history'
})
    .derive(authHook)
    .derive(({db}) => {
        const ProgressionHistoryDAO = createProgressionHistoryDAO(db)

        const DecksRepository = createDecksRepository({
            db: db,
            deckMapper: deckMapper, decksDAO: createDecksDAO(db)
        });

        const ProgressionHistoryRepository = createProgressionHistoryRepository({
            db: db,
            progressionHistoryDao: ProgressionHistoryDAO
        })

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

        const ProgressionHistoryService = createProgressionHistoryService({
            progressionHistoryRepository: ProgressionHistoryRepository,
            cardsRepository: CardsRepository,
            groupsRepository: GroupsRepository
        });

        return {
            userService: UserService,
            cardsService: CardsService,
            decksService: DecksService,
            progressionHistoryService: ProgressionHistoryService
        };
    })
    .get(`/:groupId`, async ({progressionHistoryService, params, user}) => {
        return progressionHistoryService.getGroupCardsIntervalHistory(user.id, params.groupId);
    })