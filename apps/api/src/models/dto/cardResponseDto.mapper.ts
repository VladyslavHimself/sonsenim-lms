import {Card} from "../domain/Card.model";
import {CardResponse} from "@sonsenim/contracts";


export const cardResponseDtoMapper = {
    toDTO(card: Card): CardResponse {
        const { deckId, id, ...slicedCard } = card;
        return {...slicedCard, cardId: id};
    },

    toDTOList(cards: Card[]): CardResponse [] {
        return cards.map(cardResponseDtoMapper.toDTO);
    }
}