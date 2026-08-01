import {describe, expect, it, mock} from "bun:test";
import {createDecksService} from "./decks.service";
import {DecksException} from "../exceptions/DecksException";
import {GroupsError} from "../exceptions/GroupsException";

const OWNER_ID = "owner-user-id";
const INTRUDER_ID = "intruder-user-id";
const GROUP_ID = "group-id";
const DECK_ID = "deck-id";

const deckConfiguration = {
    name: "Deck",
    isModeNormal: true,
    isModeReversed: false,
    isModeTyping: false,
    isRandomizedOrder: false
};

function createService(overrides: {
    decksRepository?: Record<string, unknown>,
    groupsRepository?: Record<string, unknown>
} = {}) {
    const decksRepository = {
        getGroupDecks: mock(async () => [{id: DECK_ID}]),
        findDeckForUser: mock(async () => ({id: DECK_ID, name: "Deck"})),
        updateDeckForUser: mock(async () => ({id: DECK_ID})),
        deleteDeckForUser: mock(async () => ({id: DECK_ID})),
        ...overrides.decksRepository
    };

    const groupsRepository = {
        getByIdAndUserId: mock(async () => ({id: GROUP_ID})),
        ...overrides.groupsRepository
    };

    const service = createDecksService({
        decksRepository: decksRepository as never,
        groupsRepository: groupsRepository as never
    });

    return {service, decksRepository, groupsRepository};
}

/** A repository double that behaves like the real ownership-scoped query: no match for a non-owner. */
function ownershipScoped<T extends unknown[]>(resolve: (...args: T) => unknown) {
    return mock(async (...args: T) => {
        const result = resolve(...args);
        if (!result) throw new DecksException("Deck not found", 404);
        return result;
    });
}

describe("decksService ownership enforcement", () => {
    describe("getDecksFromGroup", () => {
        it("returns the group's decks for its owner", async () => {
            const {service, groupsRepository, decksRepository} = createService();

            const decks = await service.getDecksFromGroup(OWNER_ID, GROUP_ID);

            expect(groupsRepository.getByIdAndUserId).toHaveBeenCalledWith(GROUP_ID, OWNER_ID);
            expect(decksRepository.getGroupDecks).toHaveBeenCalledWith(GROUP_ID);
            expect(decks).toHaveLength(1);
        });

        it("rejects a user who does not own the group, without reading any decks", async () => {
            const {service, decksRepository} = createService({
                groupsRepository: {
                    getByIdAndUserId: mock(async () => {
                        throw new GroupsError("Group not found", 404);
                    })
                }
            });

            await expect(service.getDecksFromGroup(INTRUDER_ID, GROUP_ID))
                .rejects.toMatchObject({status: 404});
            expect(decksRepository.getGroupDecks).not.toHaveBeenCalled();
        });
    });

    describe("getDeck", () => {
        it("returns the deck for its owner", async () => {
            const {service, decksRepository} = createService();

            await service.getDeck(OWNER_ID, DECK_ID);

            expect(decksRepository.findDeckForUser).toHaveBeenCalledWith(DECK_ID, OWNER_ID);
        });

        it("404s for a user who does not own the deck", async () => {
            const {service} = createService({
                decksRepository: {
                    findDeckForUser: ownershipScoped((_deckId, userId) => userId === OWNER_ID && {id: DECK_ID})
                }
            });

            await expect(service.getDeck(INTRUDER_ID, DECK_ID))
                .rejects.toMatchObject({status: 404});
        });
    });

    describe("updateDeck", () => {
        it("updates the deck for its owner", async () => {
            const {service, decksRepository} = createService();

            await service.updateDeck(OWNER_ID, DECK_ID, deckConfiguration);

            expect(decksRepository.updateDeckForUser).toHaveBeenCalledWith(DECK_ID, OWNER_ID, deckConfiguration);
        });

        it("404s for a user who does not own the deck, without writing", async () => {
            const {service, decksRepository} = createService({
                decksRepository: {
                    findDeckForUser: ownershipScoped((_deckId, userId) => userId === OWNER_ID && {id: DECK_ID})
                }
            });

            await expect(service.updateDeck(INTRUDER_ID, DECK_ID, deckConfiguration))
                .rejects.toMatchObject({status: 404});
            expect(decksRepository.updateDeckForUser).not.toHaveBeenCalled();
        });
    });

    describe("deleteDeck", () => {
        it("deletes the deck for its owner", async () => {
            const {service, decksRepository} = createService();

            await service.deleteDeck(OWNER_ID, DECK_ID);

            expect(decksRepository.deleteDeckForUser).toHaveBeenCalledWith(DECK_ID, OWNER_ID);
        });

        it("404s for a user who does not own the deck", async () => {
            const {service} = createService({
                decksRepository: {
                    deleteDeckForUser: ownershipScoped((_deckId, userId) => userId === OWNER_ID && {id: DECK_ID})
                }
            });

            await expect(service.deleteDeck(INTRUDER_ID, DECK_ID))
                .rejects.toMatchObject({status: 404});
        });
    });
});
