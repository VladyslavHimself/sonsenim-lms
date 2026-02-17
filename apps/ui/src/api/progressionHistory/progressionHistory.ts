import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {axiosInstances} from "@/api/axiosInstances.ts";

export type CardsIntervalHistoryResponse = {
    date: string;
    highIndicationCount: number;
    lowIndicationCount: number;
    midIndicationCount: number;
    veryLowIndicationCount: number;
}

const ProgressionHistoryApi = {

    getCardsIntervalHistory(groupId: string | number) {
        return axiosInstances.get<CardsIntervalHistoryResponse[]>(`${RESOURCE_SERVER_URL}/api/history/${groupId}`);
    },
}

export default ProgressionHistoryApi;