import {dbIns} from "../../plugins/db";
import {Group} from "../domain/Group.model";

export const GroupsDAO = {
    findByUserId: async (userId: string) => {
        return dbIns`SELECT *
                     FROM groups
                     WHERE local_user_id = ${userId}`;
    },

    findByNameAndUserId: async (groupName: string, userId: string) => {
        const rows = await dbIns`SELECT *
                                 FROM groups
                                 WHERE name = ${groupName}
                                   AND local_user_id = ${userId}`;
        return rows[0] || null;
    },

    findByIdAndUserId: async (groupId: string, userId: string) => {
        const rows = await dbIns`SELECT *
                                 FROM groups
                                 WHERE id = ${groupId}
                                   AND local_user_id = ${userId}`;

        return rows[0] || null;
    },

    save: async (groupName: string, userId: string) => {
        return dbIns`INSERT INTO groups (name, local_user_id)
                     VALUES (${groupName}, ${userId})`;
    },

    delete: async (groupId: string, userId: string) => {
        return dbIns`DELETE
                     FROM groups
                     WHERE local_user_id = ${userId}
                       AND id = ${groupId}`;
    },

    update: async (id: string, group: Partial<Group>) => {
        return dbIns`UPDATE groups
                     SET name = ${group.groupName}
                     WHERE id = ${id}`;
    }
}