import decksRepository from "../repositories/decks.repository";
import groupsRepository from "../repositories/groups.repository";
import {DecksException} from "../exceptions/DecksException";
import {DeckConfigurationBody} from "@sonsenim/contracts";

export const createDecksService = function (deps: {
    decksRepository: ReturnType<typeof decksRepository>,
    groupsRepository: ReturnType<typeof groupsRepository>
}) {
    const {decksRepository, groupsRepository} = deps;

    async function getDecksFromGroup(groupId: string) {
        return await decksRepository.getGroupDecks(groupId);
    }

    async function addDeckToGroup(user: any, groupId: string, deckConfiguration: DeckConfigurationBody) {
        const group = await groupsRepository.getByIdAndUserId(groupId, user.id);
        if (!group) throw new DecksException('Group not found', 404);

        return decksRepository.addDeckToGroup(groupId, deckConfiguration);
    }

    async function updateDeck(deckId: string, deckConfiguration: DeckConfigurationBody) {
        const existingDeck = await decksRepository.findDeck(deckId);
        await decksRepository.updateDeck(deckId, deckConfiguration);

        return {...existingDeck, ...deckConfiguration}
    }

    async function getDeck(deckId: string) {
        return decksRepository.findDeck(deckId);
    }

    async function deleteDeck(deckId: string) {
        return decksRepository.deleteDeck(deckId);
    }

    async function getDecksStats(userId: string, groupId: string) {
        const group = await groupsRepository.getByIdAndUserId(groupId, userId);
        return await decksRepository.getGroupDecksWithCardsStatistics(group.id);
    }

    return {getDecksFromGroup, getDecksStats, getDeck, addDeckToGroup, updateDeck, deleteDeck}
}