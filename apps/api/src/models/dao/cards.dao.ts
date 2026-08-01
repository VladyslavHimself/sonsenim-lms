import {Card} from "../domain/Card.model";
import filterRawSqlData from "../../helpers/filterRawSqlData";

export const createCardsDAO = (db: any) => ({
    findByDeckId: async (deckId: string) => {
        return db`SELECT *
                     FROM cards
                     WHERE deck_id = ${deckId}`;
    },

    countByGroupId: async (groupId: string) => {
        const rows = await db`
            SELECT COUNT(c.id) AS cardscount
            FROM cards c
                     JOIN decks d ON c.deck_id = d.id
            WHERE d.group_id = ${groupId}
        `;
        return +rows[0].cardscount;
    },

    add: async (deckId: string, body: Partial<Card>) => {
        // TODO: Move pre persist constants to separate file -> upd: generate trigger on db
        const {primaryWord, definition, explanation} = body;
        const prePersistIntervalStrengthValue = 0;
        return db`INSERT INTO cards (deck_id, primary_word, explanation, definition, interval_strength)
                     VALUES (${deckId}, ${primaryWord}, ${explanation || ""},
                             ${definition}, ${prePersistIntervalStrengthValue}) RETURNING *`;
    },

    findByIdForUser: async (cardId: string, userId: string) => {
        const rows = await db`SELECT c.*
                                 FROM cards c
                                          JOIN decks d ON d.id = c.deck_id
                                          JOIN groups g ON g.id = d.group_id
                                 WHERE c.id = ${cardId}
                                   AND g.local_user_id = ${userId}`;
        return filterRawSqlData(rows)[0] ?? null;
    },

    delete: async (cardId: string) => {
        return db`DELETE
                     FROM cards
                     WHERE id = ${cardId}`;
    },

    update: async (cardId: string, body: Card) => {
        const rows = await db`UPDATE cards
                                 SET primary_word         = ${body.primaryWord},
                                     explanation          = ${body.explanation},
                                     definition           = ${body.definition},
                                     next_repetition_time = ${body.nextRepetitionTime},
                                     interval_strength    = ${body.intervalStrength},
                                     deck_id              = ${body.deckId}
                                 WHERE id = ${cardId}
                                 RETURNING *
        `;

        return rows["0"] ?? null;
    }
});