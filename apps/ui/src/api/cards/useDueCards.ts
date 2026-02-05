import {useQuery} from "@tanstack/react-query";
import {CardsApi} from "@/api";
import {isFunction} from "lodash";
import {Card} from "@/api/cards/cards.ts";


export default function useDueCards(deckId: string, callback: (data: Card[]) => void) {
    const { data: dueCards, isLoading, refetch} = useQuery({
        queryKey: ['due-cards', deckId],
        queryFn: () => CardsApi.getCardsToRepeatFromDeck(deckId).then(({ data }) => {
            isFunction(callback) && callback(data);
            return data;
        }),
    });
    return { dueCards, isLoading, refetch };
}