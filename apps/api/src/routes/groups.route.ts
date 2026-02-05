import {Elysia} from "elysia";
import createGroupsService from "../services/groups.service";
import createGroupsRepository from "../repositories/groups.repository";
import {GroupsDAO} from "../models/dao/Groups.dao";
import {groupMapper} from "../mappers/group.mapper";
import createDecksRepository from "../repositories/decks.repository";
import createCardsRepository from "../repositories/cards.repository";
import {DecksDAO} from "../models/dao/decks.dao";
import {CardsDAO} from "../models/dao/cards.dao";
import {deckMapper} from "../mappers/deck.mapper";
import authHook from "../hooks/authHook";
import {GroupConfigurationBodySchema} from "@sonsenim/contracts";

const GroupsRepository = createGroupsRepository({
    groupsDAO: GroupsDAO,
});

const DecksRepository = createDecksRepository({
    decksDAO: DecksDAO,
    deckMapper: deckMapper
});

const CardsRepository = createCardsRepository({
    cardsDAO: CardsDAO,
    decksRepository: DecksRepository
});

const GroupsService = createGroupsService({
    groupsRepository: GroupsRepository,
    decksRepository: DecksRepository,
    cardsRepository: CardsRepository,
});

export const groupsRoute = new Elysia({
    name: 'groupsRoute',
    prefix: '/groups',
})
    .derive(authHook)
    .get('/', async ({user}) => {
        const userGroups = await GroupsService.getUserGroups(user.id);
        return groupMapper.toGroupDTOList(userGroups);
    })
    .post('/:groupName', async ({params, user}) => {
        await GroupsService.addUserGroup(params.groupName, user.id);
        return GroupsService.getUserGroups(user.id);
    })
    .delete('/:groupId', ({params, user}) => {
        return GroupsService.removeUserGroup(params.groupId, user.id);
    })
    .put('/:groupId', async ({params, user, body}) => {
        const group = await GroupsService.editUserGroup(params.groupId, user.id, body);
        return groupMapper.toGroupDTO(group);
    }, {
        body: GroupConfigurationBodySchema
    })
    .get('/stats/:groupId', ({user, params}) => {
        return GroupsService.getUserGroupStats(user.id, params.groupId);
    })
    .get('/user-groups-info', ({user}) => {
        return GroupsService.getUserGroupsWithInfo(user.id);
    })
