import filterRawSqlData from "../helpers/filterRawSqlData";
import {CardPersistence} from "../models/persistence/Card.persistence";
import {cardMapper} from "../mappers/card.mapper";
import createDecksRepository from "./decks.repository";
import {CardsException} from "../exceptions/CardsException";
import {Card} from "../models/domain/Card.model";
import {CardConfigurationBody} from "@sonsenim/contracts";
import {createCardsDAO} from "../models/dao/cards.dao";

export default function createCardsRepository(deps: {
    cardsDAO: ReturnType<typeof createCardsDAO>,
    decksRepository: ReturnType<typeof createDecksRepository>,
    db: any
}) {
    const {cardsDAO, decksRepository, db} = deps;

    async function getCardsFromDeck(deckId: string) {
        const cards: CardPersistence[] = filterRawSqlData(await cardsDAO.findByDeckId(deckId));
        return cardMapper.toDTOList(cards);
    }

    async function countByGroupId(groupId: string) {
        return cardsDAO.countByGroupId(groupId);
    }

    async function addNewCardToDeck(deckId: string, cardConfiguration: CardConfigurationBody) {
        const existingDeck = await decksRepository.findDeck(deckId);

        return cardsDAO.add(existingDeck.id, cardConfiguration);
    }

    async function deleteCard(deckId: string, cardId: string) {
        await decksRepository.findDeck(deckId);
        const existingCard: Card = await getCardById(cardId);
        return cardsDAO.delete(existingCard.id);
    }

    async function getCardById(cardId: string) {
        const existingCard: CardPersistence = await cardsDAO.findById(cardId);
        if (!existingCard) throw new CardsException('Card not found', 404);

        return cardMapper.toDTO(existingCard);
    }

    async function updateCard(deckId: string, cardId: string, body: CardConfigurationBody) {
        await decksRepository.findDeck(deckId);

        const existingCard: Card = await getCardById(cardId);
        const updatedCard: Card = {...existingCard, ...body};

        return await cardsDAO.update(cardId, updatedCard);
    }

    async function getDueCardsFromDeck(deckId: string) {
        await decksRepository.findDeck(deckId);

        const cards = await db`SELECT c.*
                                  FROM cards c
                                  WHERE c.deck_id = ${deckId} AND c.next_repetition_time IS NULL
                                     OR c.next_repetition_time < ${new Date()}`;

        return cardMapper.toDTOList(cards);
    }

    async function updateTimeCurveForCard(cardId: string, nextIntervalValue: number, nextRepetitionDate: Date) {
        const card: Card = await cardsDAO.findById(cardId);

        return db`UPDATE cards
                     SET (interval_strength, next_repetition_time) = (${nextIntervalValue}, ${nextRepetitionDate})
                     WHERE id = ${card.id}
        `;
    }

    return {
        addNewCardToDeck,
        deleteCard,
        updateCard,
        updateTimeCurveForCard,
        countByGroupId,
        getCardsFromDeck,
        getDueCardsFromDeck,
        getCardById
    }
}