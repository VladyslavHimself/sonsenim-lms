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

    async function getCardsFromDeck(deckId: string, userId: string) {
        await decksRepository.findDeckForUser(deckId, userId);
        const cards: CardPersistence[] = filterRawSqlData(await cardsDAO.findByDeckId(deckId));
        return cardMapper.toDTOList(cards);
    }

    async function countByGroupId(groupId: string) {
        return cardsDAO.countByGroupId(groupId);
    }

    async function addNewCardsToDeck(deckId: string, userId: string, cards: CardConfigurationBody[]) {
        await decksRepository.findDeckForUser(deckId, userId);

        const payload = cards.map(card => ({
            deck_id: deckId,
            primary_word: card.primaryWord,
            definition: card.definition,
            explanation: card.explanation,
        }));

        const rows = await db`
            INSERT INTO cards ${db(payload)} RETURNING id, deck_id, primary_word, definition, explanation;
        `;

        return rows.map((row: CardPersistence) => cardMapper.toDTO(row));
    }

    async function findGroupByCardId(cardId: string) {
        const [rows] = await db`SELECT d.group_id as groupid
                                FROM cards c
                                         JOIN decks d ON c.deck_id = d.id
                                WHERE c.id = ${cardId}`;
        return rows?.groupid || null;
    }

    async function addNewCardToDeck(deckId: string, userId: string, cardConfiguration: CardConfigurationBody) {
        const existingDeck = await decksRepository.findDeckForUser(deckId, userId);
        const newCard = await cardsDAO.add(existingDeck.id, cardConfiguration);
        return cardMapper.toDTO(newCard[0]);
    }

    async function deleteCard(deckId: string, cardId: string, userId: string) {
        await decksRepository.findDeckForUser(deckId, userId);
        const existingCard: Card = await getCardForUser(cardId, userId);
        return cardsDAO.delete(existingCard.id);
    }

    async function getCardForUser(cardId: string, userId: string): Promise<Card> {
        const existingCard: CardPersistence = await cardsDAO.findByIdForUser(cardId, userId);
        if (!existingCard) throw new CardsException('Card not found', 404);

        return cardMapper.toDTO(existingCard);
    }

    async function updateCard(deckId: string, cardId: string, userId: string, body: CardConfigurationBody) {
        await decksRepository.findDeckForUser(deckId, userId);

        const existingCard: Card = await getCardForUser(cardId, userId);
        const updatedCard: Card = {...existingCard, ...body};

        return await cardsDAO.update(cardId, updatedCard);
    }

    async function getDueCardsFromDeck(deckId: string, userId: string) {
        const existingDeck = await decksRepository.findDeckForUser(deckId, userId);

        const cards = await db`SELECT c.*
                               FROM cards c
                               WHERE c.deck_id = ${existingDeck.id}
                                 AND (c.next_repetition_time IS NULL
                                   OR c.next_repetition_time < ${new Date()})`;

        return cardMapper.toDTOList(cards);
    }

    async function updateTimeCurveForCard(cardId: string, nextIntervalValue: number, nextRepetitionDate: Date) {
        return db`UPDATE cards
                  SET (interval_strength, next_repetition_time) = (${nextIntervalValue}, ${nextRepetitionDate})
                  WHERE id = ${cardId}
        `;
    }

    async function getAllUserCardsTotal(userId: string) {
        const rows = await db`SELECT COUNT(c.id) AS total_cards_count
                              FROM cards c
                                       JOIN decks d ON d.id = c.deck_id
                                       JOIN groups g ON g.id = d.group_id
                              WHERE g.local_user_id = ${userId}`;

        return filterRawSqlData(rows)[0].total_cards_count;
    }

    return {
        addNewCardToDeck,
        addNewCardsToDeck,
        deleteCard,
        updateCard,
        updateTimeCurveForCard,
        countByGroupId,
        getCardsFromDeck,
        getDueCardsFromDeck,
        getCardForUser,
        getAllUserCardsTotal,
        findGroupByCardId
    }
}