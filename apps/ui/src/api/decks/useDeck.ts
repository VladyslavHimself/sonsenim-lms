import {useQuery} from "@tanstack/react-query";
import {DecksApi} from "@/api/decks/decks.ts";

export default function useDeck(deckId: string) {
    const { data: deck, isLoading, refetch} = useQuery({
        queryKey: ['deck', deckId],
        queryFn: () => DecksApi.getDeckById(deckId).then(({ data }) => data),
    });

    return { deck, isLoading, refetch };
}