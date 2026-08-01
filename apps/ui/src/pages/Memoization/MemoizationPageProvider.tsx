import React, {PropsWithChildren, useEffect, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import useDeck from "@/api/decks/useDeck.ts";
import useDueCardsStack from "@/pages/Memoization/useDueCardsStack.ts";
import {
    IS_ERROR_CORRECTION,
    IS_PENDING_ANSWER,
    IS_REGULAR_TEST
} from "@/pages/Memoization/memoizationPage.constants.ts";
import {MemoizationPageStage, MemoizationProgressStage} from "@/pages/Memoization/memoizationPage.types.ts";
import {isEmpty} from "lodash";
import {navigateBack} from "@/lib/navigateBack.function.ts";


// TODO: Add types later
const MemoizationPageStateContext = React.createContext<any>(null);
const MemoizationPageActionsContext = React.createContext<any>(null);

export default function MemoizationPageProvider({ children }: PropsWithChildren) {
    const [currentCardFlowStage, setCurrentCardFlowStage] = useState<MemoizationPageStage>(IS_PENDING_ANSWER);
    const [currentTestStage, setCurrentTestStage] = useState<MemoizationProgressStage>(IS_REGULAR_TEST);
    const { deckId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const isPracticeMode = searchParams.get('practice') === 'true';

    const { deck } = useDeck(deckId!);
    const { currentCard,
        dueCards,
        isDueCardsLoading,
        setDueCards,
        resolvedCards,
        setResolvedCards,
        cardsTotal,
        setCardsTotal,
        cardsToRepeat,
        setCardsToRepeat,
        markCurrentCardAsCorrect,
        markCurrentCardAsFailed,
        sessionCardsSnapshot
    } = useDueCardsStack(isPracticeMode);

    useEffect(() => {
        if (isEmpty(dueCards) && !isEmpty(cardsToRepeat)) {
            setCurrentTestStage(IS_ERROR_CORRECTION);
            setDueCards([...cardsToRepeat]);
            setCardsTotal(cardsToRepeat.length);
            setResolvedCards([]);
            setCardsToRepeat([]);
        }
    }, [cardsToRepeat, dueCards, setCardsToRepeat, setCardsTotal, setDueCards, setResolvedCards]);

    useEffect(() => {
        if (isEmpty(dueCards) && isEmpty(cardsToRepeat) && cardsTotal !== 0) {
            if (isPracticeMode) {
                navigateBack(navigate);
                return;
            }
            // TODO: hardcoded. Replace card comparison with payload data instead of additional request
            setTimeout(() => {
                navigate('/memoization/review', { replace: true, state: { cardsSnapshot: sessionCardsSnapshot, deckId }});
            }, 200)
        }
    }, [sessionCardsSnapshot, cardsToRepeat, cardsTotal, deckId, dueCards, isPracticeMode, navigate]);

    function finishSession() {
        if (currentTestStage === IS_ERROR_CORRECTION || isEmpty(cardsToRepeat)) {
            navigateBack(navigate);
            return;
        }
        setCurrentTestStage(IS_ERROR_CORRECTION);
        setDueCards([...cardsToRepeat]);
        setCardsTotal(cardsToRepeat.length);
        setResolvedCards([]);
        setCardsToRepeat([]);
    }

    return (
        <MemoizationPageStateContext.Provider value={{
            deck,
            dueCards,
            isDueCardsLoading,
            currentCard,
            currentCardFlowStage,
            currentTestStage,
            resolvedCards,
            cardsTotal,
            isPracticeMode
        }}>
            <MemoizationPageActionsContext.Provider value={{
                markCurrentCardAsCorrect,
                markCurrentCardAsFailed,
                setCurrentCardFlowStage,
                finishSession
            }}>
                {children}
            </MemoizationPageActionsContext.Provider>
        </MemoizationPageStateContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMemoizationPageState() {
    const context = React.useContext(MemoizationPageStateContext);
    if (context === 'undefined') throw new Error('useMemoizationPageState must be used within MemoizationPageProvider');
    return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMemoizationPageActions() {
    const context = React.useContext(MemoizationPageActionsContext);
    if (context === 'undefined') throw new Error('useMemoizationPageActions must be used within MemoizationPage');
    return context;
}