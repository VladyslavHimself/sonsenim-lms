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

export const cardsRoute = new Elysia({
    name: 'cardsRoute',
    prefix: '/cards',
})
    .derive(({ db }) => {
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

        const CardsService = createCardsService({
            cardsRepository: CardsRepository
        })

        return {
            cardsService: CardsService
        }
    })
    .get('/:deckId', async ({params, cardsService}) => {
        const cards = await cardsService.getCardsFromDeck(params.deckId);
        return cardResponseDtoMapper.toDTOList(cards);
    })

    .post('/:deckId', async ({params, body, cardsService}) => {
        const unwrappedBody = await unwrapBody<CardConfigurationBody>(body);
        // TODO: add updateUserCardsHistory feature
        return cardsService.addNewCardToDeck(params.deckId, unwrappedBody)
    }, {
        body: CardConfigurationBodySchema
    })

    .delete('/:deckId/:cardId', async ({ params, set, cardsService}) => {
        // TODO: add updateUserCardsHistory feature
        await cardsService.deleteCard(params.deckId, params.cardId);
        set.status = 204;
        return;
    })

    // TODO: Refactor logic once backend will be rewritten
    .put('/:deckId/:cardId', async ({ params, body, cardsService }) => {
        const unwrappedBody = await unwrapBody<CardConfigurationBody>(body);
        const updatedCard: Card = await cardsService.updateCard(params.deckId, params.cardId, unwrappedBody);
        return cardResponseDtoMapper.toDTO(updatedCard);

    }, {
        body: CardConfigurationBodySchema
    })

    .patch('/:cardId/update-curve', async ({ params, body, cardsService }) => {
        const unwrappedBody = await unwrapBody<UpdateCurveConfigurationBody>(body);
        // TODO: add updateUserCardsHistory feature
        return cardsService.updateTimeCurveForCard(params.cardId, unwrappedBody)
    }, {
        body: UpdateCurveConfigurationBodySchema
    })

    .get('/:deckId/to-repeat', async ({ params, cardsService }) => {
        const cards: Card[] = await cardsService.getDueCards(params.deckId)
        return cardResponseDtoMapper.toDTOList(cards);
    })