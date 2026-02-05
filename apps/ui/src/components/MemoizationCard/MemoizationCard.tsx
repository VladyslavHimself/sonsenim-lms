import './MemoizationCard.scss';
import {useMemoizationPageState} from "@/pages/Memoization/MemoizationPageProvider.tsx";
import {IS_CARD_FLIPPED} from "@/pages/Memoization/memoizationPage.constants.ts";

export default function MemoizationCard() {
    const { currentCard, currentCardFlowStage } = useMemoizationPageState();


    return (
        <div className="memoization-card-container">
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