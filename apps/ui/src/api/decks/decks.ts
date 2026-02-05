import axios from "axios";
import {DeckConfigurationBody, DeckResponse, DecksStatsResponse} from "@sonsenim/contracts";

export type DeckModes = Pick<DeckResponse, 'isModeReversed' | 'isModeNormal' | 'isModeTyping'>

export const DecksApi = {
    getDeckById(deckId: string) {
      return axios.get(`/api/decks/id/${deckId}`);
    },

    getDecksWithAggregatedData(groupId: string) {
        return axios.get<DecksStatsResponse[]>(`/api/decks/stats/${groupId}`);
    },

    addDeckToGroup(groupId: string, deckConfiguration: DeckConfigurationBody) {
        return axios.post(`/api/decks/${groupId}`, deckConfiguration)
    },

    updateDeck(deckId: string, deckConfiguration: DeckResponse) {
        console.log('conf', deckConfiguration);
        return axios.put(`/api/decks/${deckId}`, deckConfiguration);
    },

    deleteDeck(deckId: string) {
        return axios.delete(`/api/decks/${deckId}`);
    }
}