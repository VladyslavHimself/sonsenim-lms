import {CardsIntervalHistoryResponse} from "@/api/progressionHistory/progressionHistory.ts";


type Props = {
    actualIndications: CardsIntervalHistoryResponse | null
}

export default function WeeklyReportChartLegend({ actualIndications }: Props) {
    return (
        <div className="weekly-report-chart-legend">
            <div className="weekly-report-chart-legend-item">
                <div>Begin</div>
                <div>{actualIndications?.veryLowIndicationCount}</div>
            </div>

            <div className="weekly-report-chart-legend-item">
                <div>Low</div>
                <div>{actualIndications?.lowIndicationCount}</div>
            </div>

            <div className="weekly-report-chart-legend-item">
                <div>Med</div>
                <div>{actualIndications?.midIndicationCount}</div>
            </div>

            <div className="weekly-report-chart-legend-item">
                <div>High</div>
                <div>{actualIndications?.highIndicationCount}</div>
            </div>
        </div>
    );
};