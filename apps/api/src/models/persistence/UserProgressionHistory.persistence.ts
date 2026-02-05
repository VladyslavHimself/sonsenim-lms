import {t} from "elysia";


export const userProgressionHistoryPersistence = t.Object({
    id: t.String(),
    group_id: t.String(),
    high_indication_count: t.Number(),
    mid_indication_count: t.Number(),
    low_indication_count: t.Number(),
    very_low_indication_count: t.Number(),
    created_at: t.String(),
    updated_at: t.String(),
});

export type UserProgressionHistoryPersistence = typeof userProgressionHistoryPersistence.static;