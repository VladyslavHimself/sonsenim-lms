import './MemoizationPageHeader.scss';
import {Button} from "@/components/ui/button.tsx";
import {House} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {
    useMemoizationPageState
} from "@/pages/Memoization/MemoizationPageProvider.tsx";
import {IS_REGULAR_TEST} from "@/pages/Memoization/memoizationPage.constants.ts";

export default function MemoizationPageHeader() {
    const navigate = useNavigate();
    const { deck, currentTestStage } = useMemoizationPageState();

    const headerTitle = currentTestStage === IS_REGULAR_TEST ? deck?.deckName : "Error Correction";

    return (
        <div className="memoization-page-header">
            <Button style={{padding: '25px 15px'}}
                    onClick={() => navigate('/dashboard', { replace: true })}>
                <House size={25} />
            </Button>
            <h2>{ headerTitle }</h2>
            <Button>Finish</Button>
        </div>
    );
}