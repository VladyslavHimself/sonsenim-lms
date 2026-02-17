import {DeckConfigurationBody, DeckResponse, DecksStatsResponse} from "@sonsenim/contracts";
import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {axiosInstances} from "@/api/axiosInstances.ts";

export type DeckModes = Pick<DeckResponse, 'isModeReversed' | 'isModeNormal' | 'isModeTyping'>

export const DecksApi = {
    getDeckById(deckId: string) {
      return axiosInstances.get(`${RESOURCE_SERVER_URL}/api/decks/id/${deckId}`);
    },

    getDecksWithAggregatedData(groupId: string) {
        return axiosInstances.get<DecksStatsResponse[]>(`${RESOURCE_SERVER_URL}/api/decks/stats/${groupId}`);
    },

    addDeckToGroup(groupId: string, deckConfiguration: DeckConfigurationBody) {
        return axiosInstances.post(`${RESOURCE_SERVER_URL}/api/decks/${groupId}`, deckConfiguration)
    },

    updateDeck(deckId: string, deckConfiguration: DeckResponse) {
        return axiosInstances.put(`${RESOURCE_SERVER_URL}/api/decks/${deckId}`, deckConfiguration);
    },

    deleteDeck(deckId: string) {
        return axiosInstances.delete(`${RESOURCE_SERVER_URL}/api/decks/${deckId}`);
    }
}