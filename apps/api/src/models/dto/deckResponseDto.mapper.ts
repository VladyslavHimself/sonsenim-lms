import {Deck} from "../domain/Deck.model";
import {DeckResponse} from "@sonsenim/contracts";


export const deckResponseDtoMapper = {
    toDTO: (deck: Deck): DeckResponse => {
        const { groupId, ...slicedDeck} = deck;
        return slicedDeck;
    }
};