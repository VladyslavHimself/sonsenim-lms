import {useQuery} from "@tanstack/react-query";
import {CardsApi} from "@/api";


export default function useCards(deckId: string) {
    const { data: deckCards, isLoading, refetch} = useQuery({
        queryKey: ['cards', deckId],
        queryFn: () => CardsApi.getCardsInDeck(deckId).then(({ data }) => data)
    });

    return { deckCards, isLoading, refetch };
}