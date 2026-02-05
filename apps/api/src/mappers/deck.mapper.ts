import {DeckPersistence} from "../models/persistence/Deck.persistence";
import {Deck} from "../models/domain/Deck.model";

export function getBaseDeckFields(deck: DeckPersistence): Deck {
    return {
        id: deck.id,
        groupId: deck.group_id,
        name: deck.name,

        isModeNormal: deck.is_mode_normal,
        isModeReversed: deck.is_mode_reversed,
        isModeTyping: deck.is_mode_typing,
        isRandomizedOrder: deck.is_randomized_order,

        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
    }
}

export const deckMapper = {
    toDTO(deck: DeckPersistence): Deck {
        return getBaseDeckFields(deck);
    },

    toDTOList(groups: DeckPersistence[]): Deck[] {
        return groups.map(deckMapper.toDTO);
    }
};