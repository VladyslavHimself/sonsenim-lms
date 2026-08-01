import {useQuery} from "@tanstack/react-query";
import {CardsApi} from "@/api";
import {isFunction} from "lodash";
import {Card} from "@/api/cards/cards.ts";


export default function useDueCards(deckId: string, callback: (data: Card[]) => void, enabled: boolean = true) {
    const { data: dueCards, isLoading, refetch} = useQuery({
        queryKey: ['due-cards', deckId],
        queryFn: () => CardsApi.getCardsToRepeatFromDeck(deckId).then(({ data }) => {
            isFunction(callback) && callback(data);
            return data;
        }),
        enabled,
    });
    return { dueCards, isLoading, refetch };
}