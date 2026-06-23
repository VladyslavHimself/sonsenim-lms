import cardsRepository from "../../repositories/cards.repository";
import {Card} from "../../models/domain/Card.model";
import {PACE_REPETITION_INTERVAL, PACE_REPETITION_INTERVAL_MIN} from "../../helpers/paceRepetitionMatrix";
import {convertIntervalToDate, decreaseInterval, increaseInterval} from "./cards.helpers";
import {CardConfigurationBody, ImportCardsConfigurationBody, UpdateCurveConfigurationBody} from "@sonsenim/contracts";

export default function createCardsService(deps: {
    cardsRepository: ReturnType<typeof cardsRepository>
}) {
    const { cardsRepository } = deps;
    async function getCardsFromDeck(deckId: string) {
        return cardsRepository.getCardsFromDeck(deckId);
    }

    async function addNewCardToDeck(deckId: string, cardConfiguration: CardConfigurationBody) {
        return cardsRepository.addNewCardToDeck(deckId, cardConfiguration);
    }

    async function importCardsToDeck(deckId: string, cards: ImportCardsConfigurationBody) {
        return cardsRepository.addNewCardsToDeck(deckId, cards);
    }

    async function deleteCard(deckId: string, cardId: string) {
        return cardsRepository.deleteCard(deckId, cardId);
    }

    async function updateCard(deckId: string, cardId: string, body: CardConfigurationBody) {
        return await cardsRepository.updateCard(deckId, cardId, body);
    }

    async function getDueCards(deckId: string) {
        return await cardsRepository.getDueCardsFromDeck(deckId);
    }


    async function updateTimeCurveForCard(cardId: string, configuration: UpdateCurveConfigurationBody) {
        const card: Card = await cardsRepository.getCardById(cardId);
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
        addNewCardToDeck,
        importCardsToDeck,
        deleteCard,
        updateCard,
        updateTimeCurveForCard,
        getUserCardsTotal
    }
}