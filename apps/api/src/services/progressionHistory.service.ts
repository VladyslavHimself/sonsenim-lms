import createProgressionHistoryRepository from "../repositories/progressionHistory.repository";
import dayjs from "dayjs";
import {ProgressionHistoryEntity} from "../models/domain/ProgressionHistoryEntityModel";
import createCardsRepository from "../repositories/cards.repository";

type ProgressionHistoryMap = {
    [key: string]: ProgressionHistoryEntity
}

const createProgressionHistoryService = function (deps: {
    progressionHistoryRepository: ReturnType<typeof createProgressionHistoryRepository>,
    cardsRepository: ReturnType<typeof createCardsRepository>
}) {
    const {progressionHistoryRepository, cardsRepository} = deps;

    async function getGroupCardsIntervalHistory(groupId: string) {
        const startDay = dayjs().subtract(7, 'day').startOf('day');
        const endDay = dayjs().add(1, 'day').startOf('day').toDate();

        const history = await progressionHistoryRepository.findSelectedDateRangeProgressionHistoryByGroupId(groupId, startDay.toDate(), endDay);
        const historyMap = _getProgressionHistoryMap(history);
        return _fulfillProgressionHistory(startDay, historyMap);
    }

    // TODO: Change param to receive just group id
    async function updateUserCardsHistory(cardId: string) {
        // TODO: Change after timezone testing (P3)
        const actualDay = dayjs().startOf('day').format('YYYY-MM-DD');
        const cardGroupId = await cardsRepository.findGroupByCardId(cardId);

        const existingHistory = await progressionHistoryRepository.findActualHistoryData(actualDay, cardGroupId);
        const userCardStats = await progressionHistoryRepository.getUserCardStats(cardGroupId);
        if (!existingHistory) {
            return progressionHistoryRepository.createNewHistory(cardGroupId, userCardStats);
        }

        return progressionHistoryRepository.updateHistory(cardGroupId, userCardStats, actualDay);
    }

    function _fulfillProgressionHistory(startDay: any, historyMap: ProgressionHistoryMap): ProgressionHistoryMap {
        let result: ProgressionHistoryMap = {};
        let last = null;

        for (let i = 1; i <= 7; i++) {
            const date = startDay.add(i, "day");
            const key = date.format("DD-MM-YYYY");
            const record = historyMap[key];

            if (record) last = record;

            result = {
                ...result, [date.format("DD-MM-YYYY")]: {
                    veryLowIndicationCount: last?.veryLowIndicationCount ?? 0,
                    lowIndicationCount: last?.lowIndicationCount ?? 0,
                    midIndicationCount: last?.midIndicationCount ?? 0,
                    highIndicationCount: last?.highIndicationCount ?? 0
                }
            }
        }

        return result;
    }

    function _getProgressionHistoryMap(progressionHistory: ProgressionHistoryEntity[]) {
        return progressionHistory.reduce((acc: ProgressionHistoryMap, curr: ProgressionHistoryEntity) => {
            const formattedDate = dayjs(curr.createdAt).format('DD-MM-YYYY');
            return {
                ...acc,
                [formattedDate]: {...curr}
            }
        }, {});
    }

    return {getGroupCardsIntervalHistory, updateUserCardsHistory};
}


export default createProgressionHistoryService;