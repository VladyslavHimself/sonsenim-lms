import {Line} from "react-chartjs-2";
import {CategoryScale, Chart, LinearScale, LineElement, PointElement, Title, Tooltip} from "chart.js";


Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
)

export default function LineChart({ data, isMobile}: any) {

    if (!data) return null;
    return (
        <div>
            <Line height={isMobile ? 180 : 270} options={{
                maintainAspectRatio: false,
            }} data={data} />
        </div>
    );
}


