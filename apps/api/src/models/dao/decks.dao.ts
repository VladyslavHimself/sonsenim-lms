import {DeckPersistence} from "../persistence/Deck.persistence";
import {Deck} from "../domain/Deck.model";


export const createDecksDAO = (db: any) => ({
    getDecksFromGroup: async (groupId: string): Promise<DeckPersistence[]> => {
        return db`SELECT *
                     FROM decks
                     WHERE group_id = ${groupId}`;
    },

    getGroupDecksCount: async (groupId: string) => {
        const rows = await db`SELECT COUNT(*) AS decksCount
                                 FROM decks
                                 WHERE group_id = ${groupId}`;
        return +rows[0].deckscount;
    },

    add: async (groupId: string, body: Partial<Deck>) => {
        return db`INSERT INTO decks (group_id, name, is_mode_typing, is_randomized_order, is_mode_reversed,
                                        is_mode_normal)
                     VALUES (${groupId}, ${body.name}, ${body.isModeTyping}, ${body.isRandomizedOrder},
                             ${body.isModeReversed}, ${body.isModeNormal})`;
    },

    findById: async (deckId: string) => {
        const rows = await db`SELECT *
                                 FROM decks
                                 WHERE id = ${deckId}`;
        return rows[0] ?? null;
    },

    update: async (deckId: string, body: Partial<Deck>) => {
        // TODO: Change to dynamic fields updating
        return db`UPDATE decks
                     SET name                = ${body.name}
                       , is_mode_normal      = ${body.isModeNormal}
                       , is_mode_reversed    = ${body.isModeReversed}
                       , is_randomized_order = ${body.isRandomizedOrder}
                       , is_mode_typing      = ${body.isModeTyping}
                     WHERE id = ${deckId}
                     RETURNING *
        `;
    },

    delete: async (deckId: string) => {
        return db`DELETE
                     FROM decks
                     WHERE id = ${deckId}`;
    }

});