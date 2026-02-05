import {useQuery} from "@tanstack/react-query";
import {DecksApi} from "@/api/decks/decks.ts";


export default function useAggregatedDecks(groupId: string) {
    const { data: aggregatedDecks, isLoading, refetch } = useQuery({
        queryKey: ['aggregated-decks', groupId],
        queryFn: () => DecksApi.getDecksWithAggregatedData(groupId)
            .then(({ data}) => data)
    })

    return { aggregatedDecks, isLoading, refetch };
}