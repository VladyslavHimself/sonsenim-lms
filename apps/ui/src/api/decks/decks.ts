import {DeckConfigurationBody, DeckResponse, DecksStatsResponse} from "@sonsenim/contracts";
import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {axiosInstance} from "@/api/axiosInstance.ts";

export type DeckModes = Pick<DeckResponse, 'isModeReversed' | 'isModeNormal' | 'isModeTyping'>

export const DecksApi = {
    getDeckById(deckId: string) {
      return axiosInstance.get(`${RESOURCE_SERVER_URL}/api/decks/id/${deckId}`);
    },

    getDecksWithAggregatedData(groupId: string) {
        return axiosInstance.get<DecksStatsResponse[]>(`${RESOURCE_SERVER_URL}/api/decks/stats/${groupId}`);
    },

    addDeckToGroup(groupId: string, deckConfiguration: DeckConfigurationBody) {
        return axiosInstance.post(`${RESOURCE_SERVER_URL}/api/decks/${groupId}`, deckConfiguration)
    },

    updateDeck(deckId: string, deckConfiguration: DeckResponse) {
        return axiosInstance.put(`${RESOURCE_SERVER_URL}/api/decks/${deckId}`, deckConfiguration);
    },

    deleteDeck(deckId: string) {
        return axiosInstance.delete(`${RESOURCE_SERVER_URL}/api/decks/${deckId}`);
    }
}