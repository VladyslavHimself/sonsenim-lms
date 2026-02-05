import axios from "axios";
import {CardConfigurationBody, UpdateCurveConfigurationBody} from "@sonsenim/contracts";

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
        return axios.post(`/api/cards/${deckId}`, newCardConfiguration);
    },

    getCardsToRepeatFromDeck(deckId: string) {
        return axios.get<Card[]>(`/api/cards/${deckId}/to-repeat`);
    },


    // TODO: Change id params to string in other areas
    getCardsInDeck(deckId: string) {
        return axios.get<Card[]>(`/api/cards/${deckId}`);
    },

    updateCard(cardId: string, deckId: string, cardConfiguration: CardConfigurationBody) {
        return axios.put(`/api/cards/${deckId}/${cardId}`, cardConfiguration);
    },

    removeCardFromDeck(deckId: string, cardId: string) {
        return axios.delete(`/api/cards/${deckId}/${cardId}`);
    },

    updateCardTimeCurve(cardId: string, configuration: UpdateCurveConfigurationBody) {
        return axios.patch(`/api/cards/${cardId}/update-curve`, configuration);
    }
};

export default CardsApi;