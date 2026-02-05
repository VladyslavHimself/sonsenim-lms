import MemoizationPageHeader from "@/components/MemoizationPageHeader/MemoizationPageHeader.tsx";
import MemoizationProgress from "@/components/MemoizationProgress/MemoizationProgress.tsx";
import MemoizationCard from "@/components/MemoizationCard/MemoizationCard.tsx";
import MemoizationPageControlButtons
    from "@/components/MemoizationPageControlButtons/MemoizationPageControlButtons.tsx";

export default function MemoizationPage() {
    return (
        <div className="memoization-page layout-wrapper">
            <MemoizationPageHeader />
            <MemoizationProgress />
            <MemoizationCard />
            <MemoizationPageControlButtons />
        </div>
    );
}
