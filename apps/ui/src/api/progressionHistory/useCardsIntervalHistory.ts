import {useQuery} from "@tanstack/react-query";
import { ProgressionHistoryApi } from "@/api";
import {useState} from "react";
import {CardsIntervalHistoryResponse} from "@/api/progressionHistory/progressionHistory.ts";


export default function useCardsIntervalHistory(deckId: string | number) {
    const [actualDayInfo, setActualDayInfo] = useState<CardsIntervalHistoryResponse | null>(null);
    const { data: cardsIntervalHistoryData, isLoading, refetch} = useQuery({
        queryKey: ['cards-interval-history', deckId],
        queryFn: () => ProgressionHistoryApi.getCardsIntervalHistory(deckId).then(({ data }) => {
            const lastDayAccessor = Object.keys(data).pop();
            setActualDayInfo(data[lastDayAccessor]);
            return data;
        })
    });

    return { cardsIntervalHistoryData, actualDayInfo, isLoading, refetch };
}