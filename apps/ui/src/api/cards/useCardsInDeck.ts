import {useQuery} from "@tanstack/react-query";
import {CardsApi} from "@/api";
import {isFunction} from "lodash";
import {Card} from "@/api/cards/cards.ts";


export default function useCardsInDeck(deckId: string, callback: (data: Card[]) => void, enabled: boolean = true) {
    const { data: cards, isLoading, refetch} = useQuery({
        queryKey: ['cards-in-deck', deckId],
        queryFn: () => CardsApi.getCardsInDeck(deckId).then(({ data }) => {
            isFunction(callback) && callback(data);
            return data;
        }),
        enabled,
    });
    return { cards, isLoading, refetch };
}
