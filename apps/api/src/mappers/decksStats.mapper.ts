import {DecksStatsResponsePersistence} from "../models/persistence/DecksStatsResponse.persistence";
import {getBaseDeckFields} from "./deck.mapper";

export const decksStatsMapper = {
    toDecksStatsDTO(deck: DecksStatsResponsePersistence) {
        return ({
            ...getBaseDeckFields(deck),
            cardsInDeckTotal: deck.cards_in_deck_total,
            dueCardsInDeck: deck.due_cards_in_deck,
        })
    },

    toDecksStatsDTOList(decks: DecksStatsResponsePersistence[]) {
        return decks.map(decksStatsMapper.toDecksStatsDTO);
    }
}