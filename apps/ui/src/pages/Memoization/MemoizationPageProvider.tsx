import React, {PropsWithChildren, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import useDeck from "@/api/decks/useDeck.ts";
import useDueCardsStack from "@/pages/Memoization/useDueCardsStack.ts";
import {
    IS_ERROR_CORRECTION,
    IS_PENDING_ANSWER,
    IS_REGULAR_TEST
} from "@/pages/Memoization/memoizationPage.constants.ts";
import {MemoizationPageStage, MemoizationProgressStage} from "@/pages/Memoization/memoizationPage.types.ts";
import {isEmpty} from "lodash";


// TODO: Add types later
const MemoizationPageStateContext = React.createContext<any>(null);
const MemoizationPageActionsContext = React.createContext<any>(null);

export default function MemoizationPageProvider({ children }: PropsWithChildren) {
    const [currentCardFlowStage, setCurrentCardFlowStage] = useState<MemoizationPageStage>(IS_PENDING_ANSWER);
    const [currentTestStage, setCurrentTestStage] = useState<MemoizationProgressStage>(IS_REGULAR_TEST);
    const { deckId } = useParams();
    const navigate = useNavigate();
    const { deck } = useDeck(deckId!);
    const { currentCard,
        dueCards,
        setDueCards,
        resolvedCards,
        setResolvedCards,
        cardsTotal,
        setCardsTotal,
        cardsToRepeat,
        setCardsToRepeat,
        markCurrentCardAsCorrect,
        markCurrentCardAsFailed,
        cardsSnapshot
    } = useDueCardsStack();

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
            // TODO: hardcoded. Replace card comparison with payload data instead of additional request
            setTimeout(() => {
                navigate('/memoization/review', { replace: true, state: { cardsSnapshot, deckId }});
            }, 200)
            // navigate('/memoization/review', { replace: true, state: { cardsSnapshot, deckId }});
        }
    }, [cardsSnapshot, cardsToRepeat, cardsTotal, deckId, dueCards, navigate]);

    return (
        <MemoizationPageStateContext.Provider value={{
            deck,
            dueCards,
            currentCard,
            currentCardFlowStage,
            currentTestStage,
            resolvedCards,
            cardsTotal
        }}>
            <MemoizationPageActionsContext.Provider value={{
                markCurrentCardAsCorrect,
                markCurrentCardAsFailed,
                setCurrentCardFlowStage
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