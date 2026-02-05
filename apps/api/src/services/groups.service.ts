import groupsRepository from "../repositories/groups.repository";
import decksRepository from "../repositories/decks.repository";
import cardsRepository from "../repositories/cards.repository";
import {GroupConfigurationBody} from "@sonsenim/contracts";

const createGroupsService = function (deps: {
    groupsRepository: ReturnType<typeof groupsRepository>,
    decksRepository: ReturnType<typeof decksRepository>,
    cardsRepository: ReturnType<typeof cardsRepository>
}) {
    const {groupsRepository, decksRepository, cardsRepository} = deps;

    async function getUserGroups(id: string) {
        return groupsRepository.getUserGroups(id);
    }

    async function getUserGroupsWithInfo(id: string) {
        return await groupsRepository.getUserGroupsWithDecksCount(id);
    }

    async function addUserGroup(groupName: string, userId: string) {
        return groupsRepository.saveUserGroup(groupName, userId);
    }

    async function removeUserGroup(groupId: string, userId: string) {
        return groupsRepository.deleteUserGroup(groupId, userId);
    }

    async function editUserGroup(groupId: string, userId: string, groupConfiguration: GroupConfigurationBody) {
        return groupsRepository.editUserGroup(groupId, userId, groupConfiguration);
    }

    async function getUserGroupStats(userId: string, groupId: string) {
        const group = await groupsRepository.getByIdAndUserId(groupId, userId);
        if (!group) throw new Error('Group not found');

        const [decksCount, cardsCount] = await Promise.all([
            decksRepository.countByGroupId(groupId),
            cardsRepository.countByGroupId(groupId)
        ]);

        return {
            decksTotal: decksCount,
            cardsTotal: cardsCount
        }
    }

    return {getUserGroups, getUserGroupStats, getUserGroupsWithInfo, addUserGroup, removeUserGroup, editUserGroup};
}

export default createGroupsService;