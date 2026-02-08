import {Elysia} from "elysia";
import createGroupsService from "../services/groups.service";
import createGroupsRepository from "../repositories/groups.repository";
import {createGroupsDAO} from "../models/dao/Groups.dao";
import {groupMapper} from "../mappers/group.mapper";
import createDecksRepository from "../repositories/decks.repository";
import createCardsRepository from "../repositories/cards.repository";
import {createDecksDAO} from "../models/dao/decks.dao";
import {deckMapper} from "../mappers/deck.mapper";
import authHook from "../hooks/authHook";
import {GroupConfigurationBody, GroupConfigurationBodySchema} from "@sonsenim/contracts";
import {createCardsDAO} from "../models/dao/cards.dao";
import unwrapBody from "../helpers/unwrapBody";

export const groupsRoute = new Elysia({
    name: 'groupsRoute',
    prefix: '/groups',
})
    .derive(authHook)
    .derive(({ db }) => {
        const decksDAO = createDecksDAO(db);

        const GroupsRepository = createGroupsRepository({
            groupsDAO: createGroupsDAO(db),
            db: db
        });

        const DecksRepository = createDecksRepository({
            decksDAO: decksDAO,
            deckMapper: deckMapper,
            db: db
        });

        const CardsRepository = createCardsRepository({
            cardsDAO: createCardsDAO(db),
            decksRepository: createDecksRepository({
                decksDAO: decksDAO,
                deckMapper: deckMapper,
                db: db
            }),
            db: db
        })

        return {
            groupsService: createGroupsService({
                groupsRepository: GroupsRepository,
                decksRepository: DecksRepository,
                cardsRepository: CardsRepository
            })
        }
    })

    .get('/', async ({user, groupsService}) => {
        const userGroups = await groupsService.getUserGroups(user.id);
        return groupMapper.toGroupDTOList(userGroups);
    })
    .post('/:groupName', async ({params, user, groupsService}) => {
        await groupsService.addUserGroup(params.groupName, user.id);
        return groupsService.getUserGroups(user.id);
    })
    .delete('/:groupId', ({params, user, groupsService}) => {
        return groupsService.removeUserGroup(params.groupId, user.id);
    })
    .put('/:groupId', async ({params, user, body, groupsService}) => {
        const unwrappedBody = await unwrapBody<GroupConfigurationBody>(body);
        const group = await groupsService.editUserGroup(params.groupId, user.id, unwrappedBody);
        return groupMapper.toGroupDTO(group);
    }, {
        body: GroupConfigurationBodySchema
    })
    .get('/stats/:groupId', ({user, params, groupsService}) => {
        return groupsService.getUserGroupStats(user.id, params.groupId);
    })
    .get('/user-groups-info', ({user, groupsService}) => {
        return groupsService.getUserGroupsWithInfo(user.id);
    })

