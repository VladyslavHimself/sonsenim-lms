import {Elysia} from "elysia";
import createDecksRepository from "../repositories/decks.repository";
import {createDecksService} from "../services/decks.service";
import {deckMapper} from "../mappers/deck.mapper";
import createGroupsRepository from "../repositories/groups.repository";
import {deckResponseDtoMapper} from "../models/dto/deckResponseDto.mapper";
import authHook from "../hooks/authHook";
import {DeckConfigurationBody, DeckConfigurationBodySchema} from "@sonsenim/contracts";
import unwrapBody from "../helpers/unwrapBody";
import {createDecksDAO} from "../models/dao/decks.dao";
import {createGroupsDAO} from "../models/dao/Groups.dao";

export const decksRoute = new Elysia({
    name: 'decksRoute',
    prefix: '/decks'
})
    .derive(authHook)
    .derive(({ db }) => {
        const DecksRepository = createDecksRepository({
            decksDAO: createDecksDAO(db),
            deckMapper: deckMapper,
            db: db
        });

        const GroupsRepository = createGroupsRepository({
            groupsDAO: createGroupsDAO(db),
            db: db
        })

        const DecksService = createDecksService({
            decksRepository: DecksRepository,
            groupsRepository: GroupsRepository
        })

        return {
            decksService: DecksService,
        }
    })
    .get('/:groupId', async ({params, decksService}) => {
        const decks = await decksService.getDecksFromGroup(params.groupId);
        return decks.map(({groupId, ...rest}) =>
            ({...rest}));
    })
    .post('/:groupId', async ({params, body, user, decksService}) => {
        const unwrappedBody = await unwrapBody<DeckConfigurationBody>(body);
        return decksService.addDeckToGroup(user, params.groupId, unwrappedBody);
    }, {
        body: DeckConfigurationBodySchema
    })
    .put('/:deckId', async ({params, body, decksService}
    ) => {
        const unwrappedBody = await unwrapBody<DeckConfigurationBody>(body);
        return decksService.updateDeck(params.deckId, unwrappedBody);
    }, {
        body: DeckConfigurationBodySchema
    })
    .get('/id/:deckId', async ({params, decksService}) => {
        const deck = await decksService.getDeck(params.deckId);
        return deckResponseDtoMapper.toDTO(deck);
    })
    .delete('/:deckId', async ({params, decksService}) => {
        return decksService.deleteDeck(params.deckId);
    })
    .get('/stats/:deckId', async ({user, params, decksService}) => {
        return decksService.getDecksStats(user.id, params.deckId);
    })