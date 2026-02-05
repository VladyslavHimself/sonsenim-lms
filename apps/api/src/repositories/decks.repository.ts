import {DecksDAO} from "../models/dao/decks.dao";
import {deckMapper} from "../mappers/deck.mapper";
import {Deck} from "../models/domain/Deck.model";
import {DecksException} from "../exceptions/DecksException";
import {dbIns} from "../plugins/db";
import {DecksStatsResponsePersistence} from "../models/persistence/DecksStatsResponse.persistence";
import {decksStatsMapper} from "../mappers/decksStats.mapper";
import filterRawSqlData from "../helpers/filterRawSqlData";
import {DeckConfigurationBody} from "@sonsenim/contracts";

export default function createDecksRepository(deps: {
    decksDAO: typeof DecksDAO,
    deckMapper: typeof deckMapper,
}) {
    const {decksDAO, deckMapper} = deps;

    async function getGroupDecks(groupId: string) {
        const rawDecks = await decksDAO.getDecksFromGroup(groupId);
        // TODO: separate to filter helper
        return deckMapper.toDTOList(filterRawSqlData(rawDecks));
    }

    async function addDeckToGroup(groupId: string, deckConfiguration: DeckConfigurationBody) {
        return decksDAO.add(groupId, deckConfiguration);
    }

    async function countByGroupId(groupId: string) {
        return await decksDAO.getGroupDecksCount(groupId);
    }

    async function getGroupDecksWithCardsStatistics(groupId: string) {
        const rows: DecksStatsResponsePersistence[] = await dbIns`SELECT d.id,
                                                                         d.name,
                                                                         d.is_mode_normal,
                                                                         d.is_mode_reversed,
                                                                         d.is_mode_typing,
                                                                         d.is_randomized_order,
                                                                         d.created_at,
                                                                         COUNT(c) as cards_in_deck_total,
                                                                         COUNT(c)
                                                                                     FILTER ( WHERE c.next_repetition_time IS NULL OR c.next_repetition_time < ${new Date()}) as due_cards_in_deck
                                                                  FROM decks d
                                                                           LEFT JOIN cards c ON d.id = c.deck_id
                                                                  WHERE d.group_id = ${groupId}
                                                                  GROUP BY d.id`;

        const filteredRows = rows.filter((row: DecksStatsResponsePersistence) => typeof row === 'object' && row);
        return decksStatsMapper.toDecksStatsDTOList(filteredRows);
    }

    async function findDeck(deckId: string): Promise<Deck> {
        const foundDeck = await decksDAO.findById(deckId)
        if (!foundDeck) throw new DecksException('Deck not found', 404);
        return deckMapper.toDTO(foundDeck);
    }

    async function updateDeck(deckId: string, deckConfiguration: DeckConfigurationBody) {
        return decksDAO.update(deckId, deckConfiguration);
    }

    async function deleteDeck(deckId: string) {
        const foundDeck = await decksDAO.findById(deckId);
        if (!foundDeck) throw new DecksException('Deck not found', 404);

        return decksDAO.delete(deckId);
    }

    return {
        getGroupDecks,
        getGroupDecksWithCardsStatistics,
        addDeckToGroup,
        findDeck,
        updateDeck,
        deleteDeck,
        countByGroupId
    };
}