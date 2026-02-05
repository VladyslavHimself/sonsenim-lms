import {Elysia} from "elysia";
import createCardsService from "../services/cards/cards.service";
import createCardsRepository from "../repositories/cards.repository";
import {CardsDAO} from "../models/dao/cards.dao";
import {cardResponseDtoMapper} from "../models/dto/cardResponseDto.mapper";
import createDecksRepository from "../repositories/decks.repository";
import {DecksDAO} from "../models/dao/decks.dao";
import {deckMapper} from "../mappers/deck.mapper";
import {Card} from "../models/domain/Card.model";
import {CardConfigurationBodySchema, UpdateCurveConfigurationBodySchema} from "@sonsenim/contracts";

const DecksRepository = createDecksRepository({
    decksDAO: DecksDAO,
    deckMapper: deckMapper
})

const CardsRepository = createCardsRepository({
    cardsDAO: CardsDAO,
    decksRepository: DecksRepository
});

const CardsService = createCardsService({
    cardsRepository: CardsRepository
})

export const cardsRoute = new Elysia({
    name: 'cardsRoute',
    prefix: '/cards',
})
    .get('/:deckId', async ({params}) => {
        const cards = await CardsService.getCardsFromDeck(params.deckId);
        return cardResponseDtoMapper.toDTOList(cards);
    })

    .post('/:deckId', async ({params, body}) => {
        // TODO: add updateUserCardsHistory feature
        return CardsService.addNewCardToDeck(params.deckId, body)
    }, {
        body: CardConfigurationBodySchema
    })

    .delete('/:deckId/:cardId', async ({ params, set }) => {
        // TODO: add updateUserCardsHistory feature
        await CardsService.deleteCard(params.deckId, params.cardId);
        set.status = 204;
        return;
    })

    // TODO: Refactor logic once backend will be rewritten
    .put('/:deckId/:cardId', async ({ params, body }) => {
        const updatedCard: Card = await CardsService.updateCard(params.deckId, params.cardId, body);
        return cardResponseDtoMapper.toDTO(updatedCard);

    }, {
        body: CardConfigurationBodySchema
    })

    .patch('/:cardId/update-curve', async ({ params, body }) => {
        // TODO: add updateUserCardsHistory feature
        return CardsService.updateTimeCurveForCard(params.cardId, body)
    }, {
        body: UpdateCurveConfigurationBodySchema
    })

    .get('/:deckId/to-repeat', async ({ params }) => {
        const cards: Card[] = await CardsService.getDueCards(params.deckId)
        return cardResponseDtoMapper.toDTOList(cards);
    })
