import axios from "axios";

export type CardsIntervalHistoryResponse = {
    date: string;
    highIndicationCount: number;
    lowIndicationCount: number;
    midIndicationCount: number;
    veryLowIndicationCount: number;
}

const ProgressionHistoryApi = {

    getCardsIntervalHistory(groupId: string | number) {
        return axios.get<CardsIntervalHistoryResponse[]>(`/api/history/${groupId}`);
    },
}

export default ProgressionHistoryApi;