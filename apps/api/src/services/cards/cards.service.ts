import cardsRepository from "../../repositories/cards.repository";
import {Card} from "../../models/domain/Card.model";
import {PACE_REPETITION_INTERVAL, PACE_REPETITION_INTERVAL_MIN} from "../../helpers/paceRepetitionMatrix";
import {convertIntervalToDate, decreaseInterval, increaseInterval} from "./cards.helpers";
import {CardConfigurationBody, ImportCardsConfigurationBody, UpdateCurveConfigurationBody} from "@sonsenim/contracts";

export default function createCardsService(deps: {
    cardsRepository: ReturnType<typeof cardsRepository>
}) {
    const { cardsRepository } = deps;
    async function getCardsFromDeck(userId: string, deckId: string) {
        return cardsRepository.getCardsFromDeck(deckId, userId);
    }

    async function addNewCardToDeck(userId: string, deckId: string, cardConfiguration: CardConfigurationBody) {
        return cardsRepository.addNewCardToDeck(deckId, userId, cardConfiguration);
    }

    async function importCardsToDeck(userId: string, deckId: string, cards: ImportCardsConfigurationBody) {
        return cardsRepository.addNewCardsToDeck(deckId, userId, cards);
    }

    async function getCard(userId: string, cardId: string) {
        return cardsRepository.getCardForUser(cardId, userId);
    }

    async function deleteCard(userId: string, deckId: string, cardId: string) {
        return cardsRepository.deleteCard(deckId, cardId, userId);
    }

    async function updateCard(userId: string, deckId: string, cardId: string, body: CardConfigurationBody) {
        return await cardsRepository.updateCard(deckId, cardId, userId, body);
    }

    async function getDueCards(userId: string, deckId: string) {
        return await cardsRepository.getDueCardsFromDeck(deckId, userId);
    }


    async function updateTimeCurveForCard(userId: string, cardId: string, configuration: UpdateCurveConfigurationBody) {
        const card: Card = await cardsRepository.getCardForUser(cardId, userId);
        const currentInterval = card.intervalStrength;

        const nextIntervalValue = configuration.isAnswerRight
            ? increaseInterval(PACE_REPETITION_INTERVAL, currentInterval)
            : decreaseInterval(currentInterval, PACE_REPETITION_INTERVAL_MIN);

        const nextRepetitionDate = convertIntervalToDate(nextIntervalValue!);

        await cardsRepository.updateTimeCurveForCard(cardId, nextIntervalValue!, nextRepetitionDate);
    }

    async function getUserCardsTotal(userId: string) {
        const cardsTotal: number = await cardsRepository.getAllUserCardsTotal(userId);
        return cardsTotal;
    }

    return {
        getCardsFromDeck,
        getDueCards,
        getCard,
        addNewCardToDeck,
        importCardsToDeck,
        deleteCard,
        updateCard,
        updateTimeCurveForCard,
        getUserCardsTotal
    }
}