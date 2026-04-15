import {CardComparisonType} from "@/pages/MemoizationReview.tsx";
import './MemoizationReviewScoreboard.scss';
import LevelIndicator from "@/components/LevelIndicator/LevelIndicator.tsx";
import {resolveIntervalStrValues, resolveStrengthLevel} from "@/generals.service.ts";
import {ArrowRight} from "lucide-react";
import {useMediaQuery} from "react-responsive";
import {Spinner} from "@/components/ui/spinner.tsx";


type Props = {
    scoreList: CardComparisonType[],
    isLoading: boolean,
}


// TODO: Divide to smaller components
export default function MemoizationReviewScoreboard({ scoreList, isLoading }: Props) {
    const isMobile = useMediaQuery({query: "(max-width: 700px)"});
    return (
        <>
            <div className="review-scoreboard">
                {isLoading && <Spinner className="m-auto h-full" />}
                {
                    scoreList.map(score => {
                        const { definition, previousIntervalStr, actualIntervalStr } = score;
                        const strengthLevelText = resolveStrengthLevel(actualIntervalStr);
                        const isProgressed = actualIntervalStr > previousIntervalStr;
                        return (
                            <div className="review-scoreboard-item">
                                <div className="review-scoreboard-item-word">{definition}</div>
                                <div className="review-scoreboard-item-comparison">
                                    <div className="review-scoreboard-item-comparison-prevIntervalStr"> {`${resolveIntervalStrValues(previousIntervalStr)}`}</div>
                                    <ArrowRight style={{color: isProgressed ? '#6ED132' : '#FF7474'}}/>
                                    <div
                                        style={{color: isProgressed ? '#6ED132' : '#FF7474'}}
                                        className="review-scoreboard-item-comparison-actualIntervalStr">
                                        {`${resolveIntervalStrValues(actualIntervalStr)}`}
                                    </div>
                                </div>
                                <div className="review-scoreboard-item-interval">
                                    <LevelIndicator level={strengthLevelText}/>
                                    {!isMobile && <div className="review-scoreboard-item-interval-text">{strengthLevelText}</div>}
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </>


    );
}