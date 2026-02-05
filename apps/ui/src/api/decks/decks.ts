import axios from "axios";
import {DeckConfigurationBody} from "@sonsenim/contracts";

export type DeckModes = {
    isFlashcardNormal: boolean;
    isFlashcardReversed: boolean;
    isFlashcardTyping: boolean;
    isRandomizedOrder: boolean;
}

export type Deck = {
    id: number;
    name: string;
    createdAt: string;
} & DeckModes;

export type DeckWithAggregatedDataResponse = Deck & {
    cardsInDeckTotal: number;
    dueCardsInDeck: number;
}

export const DecksApi = {
    getDeckById(deckId: string) {
      return axios.get(`/api/decks/id/${deckId}`);
    },

    getDecksWithAggregatedData(groupId: string) {
        return axios.get<DeckWithAggregatedDataResponse[]>(`/api/decks/stats/${groupId}`);
    },

    addDeckToGroup(groupId: string, deckConfiguration: DeckConfigurationBody) {
        return axios.post(`/api/decks/${groupId}`, deckConfiguration)
    },

    updateDeck(groupId: number, deckConfiguration: DeckConfigurationBody) {
        return axios.put(`/api/decks/${groupId}`, deckConfiguration);
    },

    deleteDeck(deckId: number) {
        return axios.delete(`/api/decks/${deckId}`);
    }
}