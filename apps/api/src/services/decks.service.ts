import decksRepository from "../repositories/decks.repository";
import groupsRepository from "../repositories/groups.repository";
import {DecksException} from "../exceptions/DecksException";
import {DeckConfigurationBody} from "@sonsenim/contracts";

export const createDecksService = function (deps: {
    decksRepository: ReturnType<typeof decksRepository>,
    groupsRepository: ReturnType<typeof groupsRepository>
}) {
    const {decksRepository, groupsRepository} = deps;

    async function getDecksFromGroup(userId: string, groupId: string) {
        await groupsRepository.getByIdAndUserId(groupId, userId);
        return await decksRepository.getGroupDecks(groupId);
    }

    async function addDeckToGroup(user: any, groupId: string, deckConfiguration: DeckConfigurationBody) {
        const group = await groupsRepository.getByIdAndUserId(groupId, user.id);
        if (!group) throw new DecksException('Group not found', 404);
        return decksRepository.addDeckToGroup(groupId, deckConfiguration);
    }

    async function updateDeck(userId: string, deckId: string, deckConfiguration: DeckConfigurationBody) {
        const existingDeck = await decksRepository.findDeckForUser(deckId, userId);
        await decksRepository.updateDeckForUser(deckId, userId, deckConfiguration);

        return {...existingDeck, ...deckConfiguration}
    }

    async function getDeck(userId: string, deckId: string) {
        return decksRepository.findDeckForUser(deckId, userId);
    }

    async function deleteDeck(userId: string, deckId: string) {
        return decksRepository.deleteDeckForUser(deckId, userId);
    }

    async function getDecksStats(userId: string, groupId: string) {
        const group = await groupsRepository.getByIdAndUserId(groupId, userId);
        return await decksRepository.getGroupDecksWithCardsStatistics(group.id);
    }

    async function getUserDecksTotal(userId: string) {
        const decksTotal: number = await decksRepository.getAllUserDecksTotal(userId);
        return decksTotal;
    }

    return {getDecksFromGroup, getDecksStats, getDeck, addDeckToGroup, updateDeck, deleteDeck, getUserDecksTotal}
}