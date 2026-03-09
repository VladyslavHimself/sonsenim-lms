import {Elysia} from "elysia";
import createCardsService from "../services/cards/cards.service";
import createCardsRepository from "../repositories/cards.repository";
import {cardResponseDtoMapper} from "../models/dto/cardResponseDto.mapper";
import createDecksRepository from "../repositories/decks.repository";
import {deckMapper} from "../mappers/deck.mapper";
import {Card} from "../models/domain/Card.model";
import {
    CardConfigurationBody,
    CardConfigurationBodySchema, UpdateCurveConfigurationBody,
    UpdateCurveConfigurationBodySchema
} from "@sonsenim/contracts";
import {createCardsDAO} from "../models/dao/cards.dao";
import {createDecksDAO} from "../models/dao/decks.dao";
import unwrapBody from "../helpers/unwrapBody";
import authHook from "../hooks/authHook";
import createProgressionHistoryRepository from "../repositories/progressionHistory.repository";
import createProgressionHistoryService from "../services/progressionHistory.service";
import {createProgressionHistoryDAO} from "../models/dao/progressionHistory.dao";

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

        const ProgressionHistoryService = createProgressionHistoryService({
            progressionHistoryRepository: ProgressionHistoryRepository,
            cardsRepository: CardsRepository
        })

        const CardsService = createCardsService({
            cardsRepository: CardsRepository
        })

        return {
            cardsService: CardsService,
            progressionHistoryService: ProgressionHistoryService
        }
    })
    .get('/:deckId', async ({params, cardsService}) => {
        const cards = await cardsService.getCardsFromDeck(params.deckId);
        return cardResponseDtoMapper.toDTOList(cards);
    })

    .post('/:deckId', async ({params, body, cardsService, progressionHistoryService}) => {
        const unwrappedBody = await unwrapBody<CardConfigurationBody>(body);
        const newCard = await cardsService.addNewCardToDeck(params.deckId, unwrappedBody);
        await progressionHistoryService.updateUserCardsHistory(newCard.id);
        return newCard;
    }, {
        body: CardConfigurationBodySchema
    })

    .delete('/:deckId/:cardId', async ({params, set, cardsService, progressionHistoryService}) => {
        await progressionHistoryService.updateUserCardsHistory(params.cardId);
        await cardsService.deleteCard(params.deckId, params.cardId);
        set.status = 204;
        return;
    })

    // TODO: Refactor logic once backend will be rewritten
    .put('/:deckId/:cardId', async ({params, body, cardsService}) => {
        const unwrappedBody = await unwrapBody<CardConfigurationBody>(body);
        const updatedCard: Card = await cardsService.updateCard(params.deckId, params.cardId, unwrappedBody);
        return cardResponseDtoMapper.toDTO(updatedCard);

    }, {
        body: CardConfigurationBodySchema
    })

    .patch('/:cardId/update-curve', async ({params, body, cardsService, progressionHistoryService}) => {
        const unwrappedBody = await unwrapBody<UpdateCurveConfigurationBody>(body);
        const newTimeCurve = await cardsService.updateTimeCurveForCard(params.cardId, unwrappedBody)
        await progressionHistoryService.updateUserCardsHistory(params.cardId);
        return newTimeCurve;
    }, {
        body: UpdateCurveConfigurationBodySchema
    })

    .get('/:deckId/to-repeat', async ({params, cardsService}) => {
        const cards: Card[] = await cardsService.getDueCards(params.deckId)
        return cardResponseDtoMapper.toDTOList(cards);
    })