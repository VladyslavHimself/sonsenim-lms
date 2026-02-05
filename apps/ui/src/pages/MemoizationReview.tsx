import '@/styles/layout-wrapper.styles.scss';
import {Button} from "@/components/ui/button.tsx";
import {House} from "lucide-react";
import {useLocation, useNavigate} from "react-router-dom";
import useCards from "@/api/cards/useCards.ts";
import {useMemo} from "react";
import {Card} from "@/api/cards/cards.ts";
import MemoizationReviewScoreboard from "@/components/MemoizationReviewScoreboard/MemoizationReviewScoreboard.tsx";

export type CardComparisonType = {
    definition: string;
    previousIntervalStr: number,
    actualIntervalStr: number,
}

export default function MemoizationReview() {
    const navigate = useNavigate();
    const {state} = useLocation();
    const { deckCards } = useCards(state.deckId);

    const scoreList: CardComparisonType[] = useMemo(() => {
        return state?.cardsSnapshot.reduce((accumulator: Card[], card: Card) => {
            const actualCard = deckCards?.find(_actualCard => _actualCard.cardId === card.cardId);
            if (!actualCard) return accumulator;
            return [...accumulator, {
                definition: card.definition,
                previousIntervalStr: card.intervalStrength,
                actualIntervalStr: actualCard.intervalStrength
            }];
        }, []);
    }, [deckCards, state]);

    return (
        <div className="memoization-page layout-wrapper">
            <div className="memoization-page-header">
                <Button style={{padding: '25px 15px'}}
                        onClick={() => navigate('/dashboard', {replace: true})}>
                    <House size={25}/>
                </Button>
                <h2>The test had been completed!</h2>
                <div></div>
            </div>
            <MemoizationReviewScoreboard scoreList={scoreList} />
            <Button
                style={{padding: '25px 15px', width: '250px', margin: '0 auto', marginTop: 20}}
                onClick={() => navigate('/dashboard', {replace: true})}
            >Continue</Button>
        </div>
    );
}
