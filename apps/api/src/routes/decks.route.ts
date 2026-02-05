import {Elysia} from "elysia";
import createDecksRepository from "../repositories/decks.repository";
import {DecksDAO} from "../models/dao/decks.dao";
import {createDecksService} from "../services/decks.service";
import {deckMapper} from "../mappers/deck.mapper";
import createGroupsRepository from "../repositories/groups.repository";
import {GroupsDAO} from "../models/dao/Groups.dao";
import {deckResponseDtoMapper} from "../models/dto/deckResponseDto.mapper";
import authHook from "../hooks/authHook";
import {DeckConfigurationBodySchema} from "@sonsenim/contracts";

const GroupsRepository = createGroupsRepository({
    groupsDAO: GroupsDAO
})

const DecksRepository = createDecksRepository({
    decksDAO: DecksDAO,
    deckMapper: deckMapper
});

const DecksService = createDecksService({
    decksRepository: DecksRepository,
    groupsRepository: GroupsRepository
})

export const decksRoute = new Elysia({
    name: 'decksRoute',
    prefix: '/decks'
})
    .derive(authHook)
    .get('/:groupId', async ({params}) => {
        const decks = await DecksService.getDecksFromGroup(params.groupId);
        return decks.map(({groupId, ...rest}) =>
            ({...rest}));
    })
    .post('/:groupId', async ({params, body, user}) => {
        return DecksService.addDeckToGroup(user, params.groupId, body);
    }, {
        body: DeckConfigurationBodySchema
    })
    .put('/:deckId', async ({params, body}) => {
        return DecksService.updateDeck(params.deckId, body);
    }, {
        body: DeckConfigurationBodySchema
    })
    .get('/id/:deckId', async ({params}) => {
        const deck = await DecksService.getDeck(params.deckId);
        return deckResponseDtoMapper.toDTO(deck);
    })
    .delete('/:deckId', async ({params}) => {
        return DecksService.deleteDeck(params.deckId);
    })
    .get('/stats/:deckId', async ({user, params}) => {
        return DecksService.getDecksStats(user.id, params.deckId);
    })