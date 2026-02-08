import {CardConfigurationBody, UpdateCurveConfigurationBody} from "@sonsenim/contracts";
import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {axiosInstance} from "@/api/axiosInstance.ts";

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
        return axiosInstance.post(`${RESOURCE_SERVER_URL}/api/cards/${deckId}`, newCardConfiguration);
    },

    getCardsToRepeatFromDeck(deckId: string) {
        return axiosInstance.get<Card[]>(`${RESOURCE_SERVER_URL}/api/cards/${deckId}/to-repeat`);
    },


    // TODO: Change id params to string in other areas
    getCardsInDeck(deckId: string) {
        return axiosInstance.get<Card[]>(`${RESOURCE_SERVER_URL}/api/cards/${deckId}`);
    },

    updateCard(cardId: string, deckId: string, cardConfiguration: CardConfigurationBody) {
        return axiosInstance.put(`${RESOURCE_SERVER_URL}/api/cards/${deckId}/${cardId}`, cardConfiguration);
    },

    removeCardFromDeck(deckId: string, cardId: string) {
        return axiosInstance.delete(`${RESOURCE_SERVER_URL}/api/cards/${deckId}/${cardId}`);
    },

    updateCardTimeCurve(cardId: string, configuration: UpdateCurveConfigurationBody) {
        return axiosInstance.patch(`${RESOURCE_SERVER_URL}/api/cards/${cardId}/update-curve`, configuration);
    }
};

export default CardsApi;