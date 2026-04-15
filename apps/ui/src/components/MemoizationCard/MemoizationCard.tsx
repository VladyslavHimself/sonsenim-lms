import './MemoizationCard.scss';
import {useMemoizationPageState} from "@/pages/Memoization/MemoizationPageProvider.tsx";
import {IS_CARD_FLIPPED} from "@/pages/Memoization/memoizationPage.constants.ts";
import {Spinner} from "@/components/ui/spinner.tsx";

export default function MemoizationCard() {
    const { currentCard, dueCards, isDueCardsLoading, currentCardFlowStage } = useMemoizationPageState();

    return (
        <div className="memoization-card-container">
            { isDueCardsLoading && <Spinner /> }
            <div className="memoization-card-word">{currentCard?.primaryWord}</div>
            { currentCardFlowStage === IS_CARD_FLIPPED && (
                <>
                    <div className="memoization-card-flip-word">{currentCard?.definition}</div>
                    <div className="memoization-card-description">
                        {currentCard?.explanation}
                    </div>
                </>
            )}

        </div>
    );
}