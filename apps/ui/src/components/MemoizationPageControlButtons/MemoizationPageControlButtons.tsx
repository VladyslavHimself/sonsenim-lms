import './MemoizationPageControlButtons.scss';
import {
    ERROR_CORRECTION_BUTTONS_CONFIGURATION,
    IS_CARD_FLIPPED, IS_PENDING_ANSWER,
    IS_REGULAR_TEST,
    REGULAR_TEST_BUTTONS_CONFIGURATION
} from "@/pages/Memoization/memoizationPage.constants.ts";
import {Button} from "@/components/ui/button.tsx";
import {LucideRotateCw, ThumbsDown, ThumbsUp} from "lucide-react";
import {useMemoizationPageActions, useMemoizationPageState} from "@/pages/Memoization/MemoizationPageProvider.tsx";
import {isFunction} from "lodash";

export default function MemoizationPageControlButtons() {
    const { currentCardFlowStage, currentTestStage } = useMemoizationPageState();
    const { markCurrentCardAsCorrect, markCurrentCardAsFailed, setCurrentCardFlowStage } = useMemoizationPageActions();

    const buttonsConfiguration = currentTestStage === IS_REGULAR_TEST ? REGULAR_TEST_BUTTONS_CONFIGURATION
        : ERROR_CORRECTION_BUTTONS_CONFIGURATION;

    return (
        <div className="memoization-page-buttons">
            {currentCardFlowStage === IS_PENDING_ANSWER &&
                (<div className="memoization-page-buttons">
                    <Button className="memoization-button"
                            onClick={() => setFlippedStatus()}><LucideRotateCw/>Flip card</Button>
                </div>)
            }

            {currentCardFlowStage === IS_CARD_FLIPPED && (
                <div className="memoization-page-buttons">
                    <Button className="memoization-button fail-button"
                            onClick={() => withSetNextStage(setPendingAnswerStatus,
                                () => markCurrentCardAsFailed(buttonsConfiguration))}><ThumbsDown/></Button>
                    <Button className="memoization-button success-button"
                            onClick={() => withSetNextStage(setPendingAnswerStatus,
                                () => markCurrentCardAsCorrect(buttonsConfiguration))}><ThumbsUp/></Button>
                </div>)
            }
        </div>
    );

    function setFlippedStatus() {
        setCurrentCardFlowStage(IS_CARD_FLIPPED);
    }

    function setPendingAnswerStatus() {
        setCurrentCardFlowStage(IS_PENDING_ANSWER); }
}


function withSetNextStage(setStage: () => void, fn?: () => void) {
    isFunction(setStage) && setStage();
    isFunction(fn) && fn();
}