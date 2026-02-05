import './DashboardContentSection.scss';
import {useQueryClient} from "@tanstack/react-query";
import {UserGroupResponse} from "@/api/groups/groups.ts";
import NoGroupsAlert from "@/components/Dashboard/DashboardContentSection/NoGroupsAlert.tsx";
import useUserGroupStatistics from "@/api/groups/useUserGroupStatistics.ts";
import {SelectionItem} from "@/components/ui/combobox.tsx";
import ContentCard from "@/components/ContentCard/ContentCard.tsx";
import useCardsIntervalHistory from "@/api/progressionHistory/useCardsIntervalHistory.ts";
import {useMediaQuery} from "react-responsive";
import LineChart from "@/components/Dashboard/DashboardContentSection/LineChart.tsx";
import {transformData} from "@/components/Dashboard/DashboardContentSection/dashboardContentSection.service.ts";
import WeeklyReportChartLegend from "@/components/Dashboard/WeeklyReportChartLegend/WeeklyReportChartLegend.tsx";

type Props = {
    selectedGroup: SelectionItem
}



export default function DashboardContentSection({ selectedGroup }: Props) {
    const isMobile = useMediaQuery({query: "(max-width: 700px)"});
    const query = useQueryClient();
    const { groupStats } = useUserGroupStatistics(selectedGroup.value);
    const isUserHaveAnyGroups =
        query.getQueryData<UserGroupResponse[]>(['user-groups'])?.length;

    const { cardsIntervalHistoryData, actualDayInfo } = useCardsIntervalHistory(selectedGroup.value);

    if (!isUserHaveAnyGroups) {
        return (
            <div className="dashboard-content-section">
                <NoGroupsAlert/>
            </div>
        )
    }

    return (
        <div className="dashboard-content-section">
            {!isMobile && <h1>Dashboard</h1>}
            <div className="dashboard-content-strip">
                <ContentCard title="Decks created" information={groupStats?.decksTotal?.toString()}/>
                <ContentCard title="Studied cards" information={groupStats?.cardsTotal?.toString()}/>
            </div>

            <h2>Weekly report</h2>
            { isMobile && <WeeklyReportChartLegend actualIndications={actualDayInfo} />}
            <div className="weekly-report-chart-container">
                { !isMobile && <WeeklyReportChartLegend actualIndications={actualDayInfo} />}
                <LineChart isMobile={isMobile} data={cardsIntervalHistoryData && transformData(cardsIntervalHistoryData)}/>
            </div>
        </div>
    );
};

