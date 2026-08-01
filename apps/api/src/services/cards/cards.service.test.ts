import {describe, expect, it, mock} from "bun:test";
import createCardsService from "./cards.service";
import {CardsException} from "../../exceptions/CardsException";
import {DecksException} from "../../exceptions/DecksException";

const OWNER_ID = "owner-user-id";
const INTRUDER_ID = "intruder-user-id";
const DECK_ID = "deck-id";
const CARD_ID = "card-id";

const cardConfiguration = {primaryWord: "word", definition: "definition", explanation: ""};


// TODO: Maybe change to beforeEach() method instead of calling manually in every test
function createService() {
    const cardsRepository = {
        getCardsFromDeck: mock(async (_deckId: string, userId: string) => {
            if (userId !== OWNER_ID) throw new DecksException("Deck not found", 404);
            return [{cardId: CARD_ID}];
        }),
        getDueCardsFromDeck: mock(async (_deckId: string, userId: string) => {
            if (userId !== OWNER_ID) throw new DecksException("Deck not found", 404);
            return [{cardId: CARD_ID}];
        }),
        addNewCardToDeck: mock(async (_deckId: string, userId: string) => {
            if (userId !== OWNER_ID) throw new DecksException("Deck not found", 404);
            return {cardId: CARD_ID};
        }),
        addNewCardsToDeck: mock(async (_deckId: string, userId: string) => {
            if (userId !== OWNER_ID) throw new DecksException("Deck not found", 404);
            return [{cardId: CARD_ID}];
        }),
        deleteCard: mock(async (_deckId: string, _cardId: string, userId: string) => {
            if (userId !== OWNER_ID) throw new DecksException("Deck not found", 404);
            return {cardId: CARD_ID};
        }),
        updateCard: mock(async (_deckId: string, _cardId: string, userId: string) => {
            if (userId !== OWNER_ID) throw new DecksException("Deck not found", 404);
            return {cardId: CARD_ID};
        }),
        getCardForUser: mock(async (_cardId: string, userId: string) => {
            if (userId !== OWNER_ID) throw new CardsException("Card not found", 404);
            return {id: CARD_ID, intervalStrength: 0};
        }),
        updateTimeCurveForCard: mock(async () => undefined)
    };

    const service = createCardsService({cardsRepository: cardsRepository as never});

    return {service, cardsRepository};
}

describe("cardsService ownership enforcement", () => {
    it("getCardsFromDeck passes the caller through and 404s for a non-owner", async () => {
        const {service, cardsRepository} = createService();

        await service.getCardsFromDeck(OWNER_ID, DECK_ID);
        expect(cardsRepository.getCardsFromDeck).toHaveBeenCalledWith(DECK_ID, OWNER_ID);

        await expect(service.getCardsFromDeck(INTRUDER_ID, DECK_ID))
            .rejects.toMatchObject({status: 404});
    });

    it("getDueCards passes the caller through and 404s for a non-owner", async () => {
        const {service, cardsRepository} = createService();

        await service.getDueCards(OWNER_ID, DECK_ID);
        expect(cardsRepository.getDueCardsFromDeck).toHaveBeenCalledWith(DECK_ID, OWNER_ID);

        await expect(service.getDueCards(INTRUDER_ID, DECK_ID))
            .rejects.toMatchObject({status: 404});
    });

    it("addNewCardToDeck passes the caller through and 404s for a non-owner", async () => {
        const {service, cardsRepository} = createService();

        await service.addNewCardToDeck(OWNER_ID, DECK_ID, cardConfiguration);
        expect(cardsRepository.addNewCardToDeck).toHaveBeenCalledWith(DECK_ID, OWNER_ID, cardConfiguration);

        await expect(service.addNewCardToDeck(INTRUDER_ID, DECK_ID, cardConfiguration))
            .rejects.toMatchObject({status: 404});
    });

    it("importCardsToDeck passes the caller through and 404s for a non-owner", async () => {
        const {service, cardsRepository} = createService();
        const cards = [cardConfiguration];

        await service.importCardsToDeck(OWNER_ID, DECK_ID, cards as never);
        expect(cardsRepository.addNewCardsToDeck).toHaveBeenCalledWith(DECK_ID, OWNER_ID, cards);

        await expect(service.importCardsToDeck(INTRUDER_ID, DECK_ID, cards as never))
            .rejects.toMatchObject({status: 404});
    });

    it("updateCard passes the caller through and 404s for a non-owner", async () => {
        const {service, cardsRepository} = createService();

        await service.updateCard(OWNER_ID, DECK_ID, CARD_ID, cardConfiguration);
        expect(cardsRepository.updateCard).toHaveBeenCalledWith(DECK_ID, CARD_ID, OWNER_ID, cardConfiguration);

        await expect(service.updateCard(INTRUDER_ID, DECK_ID, CARD_ID, cardConfiguration))
            .rejects.toMatchObject({status: 404});
    });

    it("deleteCard passes the caller through and 404s for a non-owner", async () => {
        const {service, cardsRepository} = createService();

        await service.deleteCard(OWNER_ID, DECK_ID, CARD_ID);
        expect(cardsRepository.deleteCard).toHaveBeenCalledWith(DECK_ID, CARD_ID, OWNER_ID);

        await expect(service.deleteCard(INTRUDER_ID, DECK_ID, CARD_ID))
            .rejects.toMatchObject({status: 404});
    });

    it("getCard 404s for a non-owner (guards the delete route before history is written)", async () => {
        const {service, cardsRepository} = createService();

        await service.getCard(OWNER_ID, CARD_ID);
        expect(cardsRepository.getCardForUser).toHaveBeenCalledWith(CARD_ID, OWNER_ID);

        await expect(service.getCard(INTRUDER_ID, CARD_ID))
            .rejects.toMatchObject({status: 404});
    });

    // This route has no :deckId in its URL, so the card itself is the only ownership anchor.
    it("updateTimeCurveForCard 404s for a non-owner without writing a new interval", async () => {
        const {service, cardsRepository} = createService();

        await service.updateTimeCurveForCard(OWNER_ID, CARD_ID, {isAnswerRight: true});
        expect(cardsRepository.updateTimeCurveForCard).toHaveBeenCalled();

        cardsRepository.updateTimeCurveForCard.mockClear();

        await expect(service.updateTimeCurveForCard(INTRUDER_ID, CARD_ID, {isAnswerRight: true}))
            .rejects.toMatchObject({status: 404});
        expect(cardsRepository.updateTimeCurveForCard).not.toHaveBeenCalled();
    });
});
