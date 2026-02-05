import {dbIns} from "../../plugins/db";
import {DeckPersistence} from "../persistence/Deck.persistence";
import {Deck} from "../domain/Deck.model";

export const DecksDAO = {

    getDecksFromGroup: async (groupId: string): Promise<DeckPersistence[]> => {
        return dbIns`SELECT *
                     FROM decks
                     WHERE group_id = ${groupId}`;
    },

    getGroupDecksCount: async (groupId: string) => {
        const rows = await dbIns`SELECT COUNT(*) AS decksCount
                                 FROM decks
                                 WHERE group_id = ${groupId}`;
        return +rows[0].deckscount;
    },

    add: async (groupId: string, body: Partial<Deck>) => {
        return dbIns`INSERT INTO decks (group_id, name, is_mode_typing, is_randomized_order, is_mode_reversed,
                                        is_mode_normal)
                     VALUES (${groupId}, ${body.deckName}, ${body.isFlashcardTyping}, ${body.isRandomizedOrder},
                             ${body.isFlashcardReversed}, ${body.isFlashcardNormal})`;
    },

    findById: async (deckId: string) => {
        const rows = await dbIns`SELECT * FROM decks WHERE id = ${deckId}`;
        return rows[0] ?? null;
    },

    update: async (deckId: string, body: Partial<Deck>) => {
        // TODO: Change to dynamic fields updating
        return dbIns`UPDATE decks
                     SET name                = ${body.deckName}
                       , is_mode_normal      = ${body.isFlashcardNormal}
                       , is_mode_reversed    = ${body.isFlashcardReversed}
                       , is_randomized_order = ${body.isRandomizedOrder}
                       , is_mode_typing      = ${body.isFlashcardTyping}
                     WHERE id = ${deckId}
                     RETURNING *
        `;
    },

    delete: async (deckId: string) => {
       return dbIns`DELETE
                    FROM decks
                    WHERE id = ${deckId}`;
    }
};