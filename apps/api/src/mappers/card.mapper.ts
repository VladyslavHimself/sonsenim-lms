import {CardPersistence} from "../models/persistence/Card.persistence";
import {Card} from "../models/domain/Card.model";


export function getBaseCardFields(card: CardPersistence) {
   return {
       id: card.id,
       deckId: card.deck_id,
       primaryWord: card.primary_word,
       explanation: card.explanation,
       definition: card.definition,
       nextRepetitionTime: card.next_repetition_time,
       updatedAt: card.updated_at,
       createdAt: card.created_at,
       intervalStrength: card.interval_strength
   }
}

export const cardMapper = {
    toDTO(card: CardPersistence): Card {
        return getBaseCardFields(card);
    },

    toDTOList(cards: CardPersistence[]): Card[] {
        return cards.map(cardMapper.toDTO);
    }
};