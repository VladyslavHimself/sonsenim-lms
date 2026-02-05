import {dbIns} from "../../plugins/db";
import {Card} from "../domain/Card.model";
import filterRawSqlData from "../../helpers/filterRawSqlData";

export const CardsDAO = {
    findByDeckId: async (deckId: string) => {
        return dbIns`SELECT *
                     FROM cards
                     WHERE deck_id = ${deckId}`;
    },

    countByGroupId: async (groupId: string) => {
        const rows = await dbIns`
            SELECT COUNT(c.id) AS cardscount
            FROM cards c
                     JOIN decks d ON c.deck_id = d.id
            WHERE d.group_id = ${groupId}
        `;
        return +rows[0].cardscount;
    },

    add: async (deckId: string, body: Partial<Card>) => {
        // TODO: Move pre persist constants to separate file
        const prePersistIntervalStrengthValue = 0;
        return dbIns`INSERT INTO cards (deck_id, primary_word, explanation, definition, interval_strength)
                     VALUES (${deckId}, ${body.primaryWord}, ${body.explanation},
                             ${body.definition}, ${prePersistIntervalStrengthValue})`;
    },

    findById: async (cardId: string) => {
        const rows = await dbIns`SELECT *
                                 FROM cards
                                 WHERE id = ${cardId}`;
        return filterRawSqlData(rows)[0] ?? null;
    },

    delete: async (cardId: string) => {
        return dbIns`DELETE
                     FROM cards
                     WHERE id = ${cardId}`;
    },

    update: async (cardId: string, body: Card) => {
        const rows = await dbIns`UPDATE cards
                                 SET primary_word         = ${body.primaryWord},
                                     explanation          = ${body.explanation},
                                     definition           = ${body.definition},
                                     next_repetition_time = ${body.nextRepetitionTime},
                                     interval_strength    = ${body.intervalStrength},
                                     deck_id              = ${body.deckId}
                                 WHERE id = ${cardId} RETURNING *
        `;

        return rows["0"] ?? null;
    }
}