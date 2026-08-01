import {Line} from "react-chartjs-2";
import {CategoryScale, Chart, LinearScale, LineElement, PointElement, Title, Tooltip} from "chart.js";
import {useMemo} from "react";
import {useTheme} from "@/theme/ThemeProvider.tsx";
import {getChartTheme} from "@/components/Dashboard/DashboardContentSection/dashboardContentSection.service.ts";


Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
)

export default function LineChart({ data, isMobile}: any) {
    const {resolvedTheme} = useTheme();

    const options = useMemo(() => {
        const {text, grid} = getChartTheme();

        return {
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {color: text},
                    grid: {color: grid},
                },
                y: {
                    ticks: {color: text},
                    grid: {color: grid},
                },
            },
        };
    }, [resolvedTheme]);

    if (!data) return null;
    return (
        <div>
            <Line key={resolvedTheme} height={isMobile ? 180 : 270} options={options} data={data} />
        </div>
    );
}
