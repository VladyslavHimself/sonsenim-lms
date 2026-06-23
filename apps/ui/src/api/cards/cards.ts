import {CardConfigurationBody, ImportCardsConfigurationBody, UpdateCurveConfigurationBody} from "@sonsenim/contracts";
import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {axiosInstances} from "@/api/axiosInstances.ts";

export type Card = {
    cardId: number,
    primaryWord: string,
    definition: string,
    explanation: string,
    nextRepetitionTime: string,
    intervalStrength: number,
    createdAt: string,
}

const CardsApi = {
    addCardToDeck(deckId: number, newCardConfiguration: CardConfigurationBody) {
        return axiosInstances.post(`${RESOURCE_SERVER_URL}/api/cards/${deckId}`, newCardConfiguration);
    },

    importCardsToDeck(deckId: string, cards: ImportCardsConfigurationBody) {
        return axiosInstances.post(`${RESOURCE_SERVER_URL}/api/cards/${deckId}/import`, cards);
    },

    getCardsToRepeatFromDeck(deckId: string) {
        return axiosInstances.get<Card[]>(`${RESOURCE_SERVER_URL}/api/cards/${deckId}/to-repeat`);
    },


    // TODO: Change id params to string in other areas
    getCardsInDeck(deckId: string) {
        return axiosInstances.get<Card[]>(`${RESOURCE_SERVER_URL}/api/cards/${deckId}`);
    },

    updateCard(cardId: string, deckId: string, cardConfiguration: CardConfigurationBody) {
        return axiosInstances.put(`${RESOURCE_SERVER_URL}/api/cards/${deckId}/${cardId}`, cardConfiguration);
    },

    removeCardFromDeck(deckId: string, cardId: string) {
        return axiosInstances.delete(`${RESOURCE_SERVER_URL}/api/cards/${deckId}/${cardId}`);
    },

    updateCardTimeCurve(cardId: string, configuration: UpdateCurveConfigurationBody) {
        return axiosInstances.patch(`${RESOURCE_SERVER_URL}/api/cards/${cardId}/update-curve`, configuration);
    }
};

export default CardsApi;