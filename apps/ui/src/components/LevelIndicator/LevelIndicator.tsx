import './LevelIndicator.scss';
import {IntervalLevels} from "@/generals.service.ts";

type Props = {
    level: IntervalLevels
}

export default function LevelIndicator({ level }: Props) {
    return (
        <div data-level={level} className="level-indicator">
            <div/>
            <div/>
            <div/>
            <div/>
        </div>
    );
};