import {progressionHistoryMapper} from "../mappers/progressionHistory.mapper";
import filterRawSqlData from "../helpers/filterRawSqlData";
import {ProgressionHistoryEntity} from "../models/domain/ProgressionHistoryEntityModel";
import {createProgressionHistoryDAO} from "../models/dao/progressionHistory.dao";

type ProgressionHistoryStats = Pick<ProgressionHistoryEntity,
    "veryLowIndicationCount" | "lowIndicationCount" | "midIndicationCount" | "highIndicationCount">

export default function createProgressionHistoryRepository(deps: {
    db: any,
    progressionHistoryDao: ReturnType<typeof createProgressionHistoryDAO>
}) {
    const {db, progressionHistoryDao} = deps;

    async function findSelectedDateRangeProgressionHistoryByGroupId(groupId: string, startDay: Date, endDay: Date) {
        const rows = await db`
            SELECT *
            FROM users_progression_history
            WHERE group_id = ${groupId}
              AND created_at >= ${startDay}
              AND created_at < ${endDay}
            ORDER BY created_at
        `
        return progressionHistoryMapper.toDTOList(filterRawSqlData(rows));
    }

    async function findActualHistoryData(actualDay: any, groupId: string) {
        const rows = await db`
            SELECT *
            FROM users_progression_history
            WHERE group_id = ${groupId}
            AND created_at::DATE = ${actualDay}::DATE;
        `;

        if (!rows.length) return null;

        return progressionHistoryMapper.toDTO(filterRawSqlData(rows)[0]);
    }

    async function getUserCardStats(groupId: string) {
        const [row] = await db`
            SELECT COUNT(*) FILTER (WHERE interval_strength < 0.5)                AS very_low,
                   COUNT(*) FILTER (WHERE interval_strength BETWEEN 0.5 AND 6.99) AS low,
                   COUNT(*) FILTER (WHERE interval_strength BETWEEN 7 AND 89.9)   AS mid,
                   COUNT(*) FILTER (WHERE interval_strength >= 90)                AS high
            FROM cards c
                     JOIN decks d ON d.id = c.deck_id
                     JOIN groups g ON g.id = d.group_id
            WHERE g.id = ${groupId};
        `;

        return {
            veryLowIndicationCount: Number(row.very_low),
            lowIndicationCount: Number(row.low),
            midIndicationCount: Number(row.mid),
            highIndicationCount: Number(row.high),
        };
    }

    async function createNewHistory(groupId: string, stats: ProgressionHistoryStats) {
        console.log('creating new history');
        return progressionHistoryDao.save(groupId, stats);
    }

    async function updateHistory(groupId: string, stats: ProgressionHistoryStats, date: string) {
        return progressionHistoryDao.update(groupId, stats, date);
    }


    return {
        findSelectedDateRangeProgressionHistoryByGroupId,
        findActualHistoryData,
        getUserCardStats,
        createNewHistory,
        updateHistory
    }
}