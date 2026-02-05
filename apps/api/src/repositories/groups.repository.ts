import {GroupsDAO} from "../models/dao/Groups.dao";
import {GroupsError} from "../exceptions/GroupsException";
import {GroupPersistence} from "../models/persistence/Group.persistence";
import {dbIns} from "../plugins/db";
import {GroupConfigurationBody} from "@sonsenim/contracts";

type GroupWithDecksCount = {
    groupid: string,
    groupname: string,
    deckscount: number
}

export default function createGroupsRepository(deps: {
    groupsDAO: typeof GroupsDAO,
}) {
    const {groupsDAO} = deps;

    async function getUserGroups(id: string) {
        return groupsDAO.findByUserId(id);
    }

    async function getByIdAndUserId(id: string, userId: string) {
        const group = await groupsDAO.findByIdAndUserId(id, userId);
        if (!group) throw new GroupsError('Group not found', 404);

        return group;
    }

    async function saveUserGroup(groupName: string, userId: string) {
        if (await existsGroupForUserByGroupName(groupName, userId))
            throw new GroupsError('Group already exists', 409);
        return groupsDAO.save(groupName, userId);
    }

    async function deleteUserGroup(groupId: string, userId: string) {
        return groupsDAO.delete(groupId, userId);
    }

    async function getUserGroupsWithDecksCount(id: string): Promise<GroupWithDecksCount[]> {
        const rows = await dbIns`
            SELECT g.id        as groupId,
                   g.name      as groupName,
                   COUNT(d.id) AS decksCount
            FROM groups g
                     LEFT JOIN decks d ON d.group_id = g.id
            WHERE g.local_user_id = ${id}
            GROUP BY g.id
        `;

        return rows.map((row: GroupWithDecksCount) => ({
            groupId: row.groupid,
            groupName: row.groupname,
            decksCount: Number(row.deckscount)
        }));
    }

    async function existsGroupForUserByGroupName(groupName: string, userId: string) {
        const row = await groupsDAO.findByNameAndUserId(groupName, userId);
        return !!row;
    }

    async function editUserGroup(groupId: string, userId: string, groupConfiguration: GroupConfigurationBody): Promise<GroupPersistence> {
        const existingGroup = await groupsDAO.findByIdAndUserId(groupId, userId);
        if (!existingGroup) throw new GroupsError('Group not found', 404);

        await groupsDAO.update(groupId, groupConfiguration);

        return await groupsDAO.findByIdAndUserId(groupId, userId);
    }

    return {
        getUserGroups,
        getUserGroupsWithDecksCount,
        getByIdAndUserId,
        existsGroupForUserByGroupName,
        editUserGroup,
        deleteUserGroup,
        saveUserGroup
    };
}