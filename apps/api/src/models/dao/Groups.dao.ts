import {Group} from "../domain/Group.model";


export const createGroupsDAO = (db: any) => ({
    findByUserId: async (userId: string) => {
        return db`SELECT *
                     FROM groups
                     WHERE local_user_id = ${userId}`;
    },

    findByNameAndUserId: async (groupName: string, userId: string) => {
        const rows = await db`SELECT *
                                 FROM groups
                                 WHERE name = ${groupName}
                                   AND local_user_id = ${userId}`;
        return rows[0] || null;
    },

    findByIdAndUserId: async (groupId: string, userId: string) => {
        const rows = await db`SELECT *
                                 FROM groups
                                 WHERE id = ${groupId}
                                   AND local_user_id = ${userId}`;

        return rows[0] || null;
    },

    save: async (groupName: string, userId: string) => {
        return db`INSERT INTO groups (name, local_user_id)
                     VALUES (${groupName}, ${userId})`;
    },

    delete: async (groupId: string, userId: string) => {
        return db`DELETE
                     FROM groups
                     WHERE local_user_id = ${userId}
                       AND id = ${groupId}`;
    },

    update: async (id: string, group: Partial<Group>) => {
        return db`UPDATE groups
                     SET name = ${group.groupName}
                     WHERE id = ${id}`;
    }
});