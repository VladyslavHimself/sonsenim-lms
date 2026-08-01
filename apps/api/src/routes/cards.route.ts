import {Elysia} from "elysia";
import createCardsService from "../services/cards/cards.service";
import createCardsRepository from "../repositories/cards.repository";
import {cardResponseDtoMapper} from "../models/dto/cardResponseDto.mapper";
import createDecksRepository from "../repositories/decks.repository";
import {deckMapper} from "../mappers/deck.mapper";
import {Card} from "../models/domain/Card.model";
import {
    CardConfigurationBody,
    CardConfigurationBodySchema,
    ImportCardsConfigurationBody, ImportCardsConfigurationBodySchema, UpdateCurveConfigurationBody,
    UpdateCurveConfigurationBodySchema
} from "@sonsenim/contracts";
import {createCardsDAO} from "../models/dao/cards.dao";
import {createDecksDAO} from "../models/dao/decks.dao";
import unwrapBody from "../helpers/unwrapBody";
import authHook from "../hooks/authHook";
import createProgressionHistoryRepository from "../repositories/progressionHistory.repository";
import createProgressionHistoryService from "../services/progressionHistory.service";
import {createProgressionHistoryDAO} from "../models/dao/progressionHistory.dao";
import createGroupsRepository from "../repositories/groups.repository";
import {createGroupsDAO} from "../models/dao/Groups.dao";

export const cardsRoute = new Elysia({
    name: 'cardsRoute',
    prefix: '/cards',
})
    .derive(authHook)
    .derive(({db}) => {
        const ProgressionHistoryDAO = createProgressionHistoryDAO(db)

        const DecksRepository = createDecksRepository({
            decksDAO: createDecksDAO(db),
            deckMapper: deckMapper,
            db: db
        });

        const CardsRepository = createCardsRepository({
            cardsDAO: createCardsDAO(db),
            decksRepository: DecksRepository,
            db: db
        });

        const ProgressionHistoryRepository = createProgressionHistoryRepository({
            db,
            progressionHistoryDao: ProgressionHistoryDAO
        });

        const GroupsRepository = createGroupsRepository({
            groupsDAO: createGroupsDAO(db),
            db
        });

        const ProgressionHistoryService = createProgressionHistoryService({
            progressionHistoryRepository: ProgressionHistoryRepository,
            cardsRepository: CardsRepository,
            groupsRepository: GroupsRepository
        })

        const CardsService = createCardsService({
            cardsRepository: CardsRepository
        })

        return {
            cardsService: CardsService,
            progressionHistoryService: ProgressionHistoryService
        }
    })
    .get('/:deckId', async ({params, user, cardsService}) => {
        const cards = await cardsService.getCardsFromDeck(user.id, params.deckId);
        return cardResponseDtoMapper.toDTOList(cards);
    })

    .post('/:deckId', async ({params, body, user, cardsService, progressionHistoryService}) => {
        const unwrappedBody = await unwrapBody<CardConfigurationBody>(body);
        const newCard = await cardsService.addNewCardToDeck(user.id, params.deckId, unwrappedBody);
        await progressionHistoryService.updateUserCardsHistory(newCard.id);
        return newCard;
    }, {
        body: CardConfigurationBodySchema
    })

    .post ('/:deckId/import', async ({params, set, body, user, cardsService}) => {
        const unwrappedBody = await unwrapBody<ImportCardsConfigurationBody>(body);
        await cardsService.importCardsToDeck(user.id, params.deckId, unwrappedBody);
        set.status = 200;
        return;
    }, {
        body: ImportCardsConfigurationBodySchema
    })

    // History must be recorded while the card row still exists (it resolves the card's group).
    .delete('/:deckId/:cardId', async ({params, set, user, cardsService, progressionHistoryService}) => {
        await cardsService.getCard(user.id, params.cardId);
        await progressionHistoryService.updateUserCardsHistory(params.cardId);
        await cardsService.deleteCard(user.id, params.deckId, params.cardId);
        set.status = 204;
        return;
    })

    // TODO: Refactor logic once backend will be rewritten
    .put('/:deckId/:cardId', async ({params, body, user, cardsService}) => {
        const unwrappedBody = await unwrapBody<CardConfigurationBody>(body);
        const updatedCard: Card = await cardsService.updateCard(user.id, params.deckId, params.cardId, unwrappedBody);
        return cardResponseDtoMapper.toDTO(updatedCard);

    }, {
        body: CardConfigurationBodySchema
    })

    .patch('/:cardId/update-curve', async ({params, body, user, cardsService, progressionHistoryService}) => {
        const unwrappedBody = await unwrapBody<UpdateCurveConfigurationBody>(body);
        const newTimeCurve = await cardsService.updateTimeCurveForCard(user.id, params.cardId, unwrappedBody)
        await progressionHistoryService.updateUserCardsHistory(params.cardId);
        return newTimeCurve;
    }, {
        body: UpdateCurveConfigurationBodySchema
    })

    .get('/:deckId/to-repeat', async ({params, user, cardsService}) => {
        const cards: Card[] = await cardsService.getDueCards(user.id, params.deckId)
        return cardResponseDtoMapper.toDTOList(cards);
    })