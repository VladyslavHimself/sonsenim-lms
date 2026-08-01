import {describe, expect, it, mock} from "bun:test";
import createProgressionHistoryService from "./progressionHistory.service";
import {GroupsError} from "../exceptions/GroupsException";

const OWNER_ID = "owner-user-id";
const INTRUDER_ID = "intruder-user-id";
const GROUP_ID = "group-id";

function createService() {
    const progressionHistoryRepository = {
        findSelectedDateRangeProgressionHistoryByGroupId: mock(async () => [])
    };

    const groupsRepository = {
        getByIdAndUserId: mock(async (_groupId: string, userId: string) => {
            if (userId !== OWNER_ID) throw new GroupsError("Group not found", 404);
            return {id: GROUP_ID};
        })
    };

    const service = createProgressionHistoryService({
        progressionHistoryRepository: progressionHistoryRepository as never,
        cardsRepository: {} as never,
        groupsRepository: groupsRepository as never
    });

    return {service, progressionHistoryRepository, groupsRepository};
}

describe("progressionHistoryService ownership enforcement", () => {
    it("returns the group's history for its owner", async () => {
        const {service, groupsRepository, progressionHistoryRepository} = createService();

        await service.getGroupCardsIntervalHistory(OWNER_ID, GROUP_ID);

        expect(groupsRepository.getByIdAndUserId).toHaveBeenCalledWith(GROUP_ID, OWNER_ID);
        expect(progressionHistoryRepository.findSelectedDateRangeProgressionHistoryByGroupId).toHaveBeenCalled();
    });

    it("404s for a user who does not own the group, without reading any history", async () => {
        const {service, progressionHistoryRepository} = createService();

        await expect(service.getGroupCardsIntervalHistory(INTRUDER_ID, GROUP_ID))
            .rejects.toMatchObject({status: 404});
        expect(progressionHistoryRepository.findSelectedDateRangeProgressionHistoryByGroupId)
            .not.toHaveBeenCalled();
    });
});
