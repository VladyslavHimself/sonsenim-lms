import {ProgressionHistoryEntity} from "../domain/ProgressionHistoryEntityModel";

export const createProgressionHistoryDAO = (db: any) => ({
    save: async (groupId: string, body: Partial<ProgressionHistoryEntity>) => {
        const {veryLowIndicationCount, lowIndicationCount, midIndicationCount, highIndicationCount} = body;

        return db`INSERT INTO users_progression_history (group_id, very_low_indication_count, low_indication_count,
                                                         mid_indication_count, high_indication_count)
                  VALUES (${groupId},
                          ${veryLowIndicationCount}, ${lowIndicationCount}, ${midIndicationCount},
                          ${highIndicationCount})
                  RETURNING *`;

    },

    // TODO: As tech debt - refactor all 'update' methods to optional pass flexible data. (P2)
    update: async (groupId: string, body: Partial<ProgressionHistoryEntity>) => {
        const {veryLowIndicationCount, lowIndicationCount, midIndicationCount, highIndicationCount} = body;
        return db`UPDATE users_progression_history
                  SET very_low_indication_count = ${veryLowIndicationCount},
                      low_indication_count      = ${lowIndicationCount},
                      mid_indication_count      = ${midIndicationCount},
                      high_indication_count     = ${highIndicationCount}
                  WHERE group_id = ${groupId}
                  RETURNING *`;
    }

});