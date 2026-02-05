import {
    CardChoiceFlowResolveType,
    MemoizationPageStage,
    MemoizationProgressStage
} from "@/pages/Memoization/memoizationPage.types.ts";

export const IS_ERROR_CORRECTION: MemoizationProgressStage = "IS_ERROR_CORRECTION";
export const IS_REGULAR_TEST: MemoizationProgressStage = "IS_REGULAR_TEST";
export const IS_PENDING_ANSWER: MemoizationPageStage = 'isPendingAnswer';
export const IS_CARD_FLIPPED: MemoizationPageStage = 'isCardFlipped';

export const ERROR_CORRECTION_BUTTONS_CONFIGURATION: CardChoiceFlowResolveType = {isServerShouldUpdate: false}
export const REGULAR_TEST_BUTTONS_CONFIGURATION: CardChoiceFlowResolveType = {isServerShouldUpdate: true}