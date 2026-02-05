import {dbIns} from "../../plugins/db";
import {RegistrationUserBody} from "@sonsenim/contracts";

export const LocalUserDAO = {

    findById: async (id: number) => {
        const rows = await dbIns`SELECT *
                                 FROM local_users
                                 WHERE id = ${id} LIMIT 1`;
        return rows[0] ?? null;
    },

    findByUsername: async (username: string) => {
        return dbIns`SELECT *
                     FROM local_users
                     WHERE username = ${username}`;
    },

    findByEmail: async (email: string) => {
        return dbIns`SELECT *
                     FROM local_users
                     WHERE email = ${email}`;
    },

    // TODO: Change 'RegistrationUserBody' to another model instead of view layer interface
    save: async (user: RegistrationUserBody) => {
        return dbIns`INSERT INTO local_users (first_name, last_name, username, email, password)
                     VALUES (${user.firstName},
                             ${user.lastName},
                             ${user.username},
                             ${user.email},
                             ${user.password})
        `;
    }
}