import {RegistrationUserBody} from "@sonsenim/contracts";

export const createLocalUserDAO = (db: any) => ({
    findById: async (id: number) => {
        const rows = await db`SELECT *
                                 FROM local_users
                                 WHERE id = ${id} LIMIT 1`;
        return rows[0] ?? null;
    },

    findByUsername: async (username: string) => {
        return db`SELECT *
                     FROM local_users
                     WHERE username = ${username}`;
    },

    findByEmail: async (email: string) => {
        return db`SELECT *
                     FROM local_users
                     WHERE email = ${email}`;
    },

    save: async (user: RegistrationUserBody) => {
        return db`INSERT INTO local_users (first_name, last_name, username, email, password)
                     VALUES (${user.firstName},
                             ${user.lastName},
                             ${user.username},
                             ${user.email},
                             ${user.password})
        `;
    }
})