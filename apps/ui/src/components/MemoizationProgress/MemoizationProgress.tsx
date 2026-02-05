import {Progress} from "@/components/ui/progress.tsx";
import './MemoizationProgress.scss';
import {useMemoizationPageState} from "@/pages/Memoization/MemoizationPageProvider.tsx";


export default function MemoizationProgress() {
    const { cardsTotal, resolvedCards } = useMemoizationPageState();

    return (
        <div className="memoization-page-progress">
            <Progress value={Math.round((100 / cardsTotal) * resolvedCards.length)} className="memoization-page-progress-item" />
            <div className="memoization-page-progress-status">{resolvedCards.length}/{cardsTotal}</div>
        </div>
    );
}