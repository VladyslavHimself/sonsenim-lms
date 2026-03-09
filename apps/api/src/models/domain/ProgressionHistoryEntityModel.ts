import {t} from "elysia";

export const progressionHistoryEntityModel = t.Object({
    id: t.String(),
    groupId: t.String(),
    highIndicationCount: t.Number(),
    midIndicationCount: t.Number(),
    lowIndicationCount: t.Number(),
    veryLowIndicationCount: t.Number(),
    createdAt: t.String(),
    updatedAt: t.String(),
});

export type ProgressionHistoryEntity = typeof progressionHistoryEntityModel.static;