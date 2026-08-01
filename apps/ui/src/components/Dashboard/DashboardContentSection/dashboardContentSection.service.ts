import {readNumericToken, readToken} from "@/theme/tokens.ts";

type KeyColorsType = {
    veryLowIndicationCount: string,
    lowIndicationCount: string,
    midIndicationCount: string,
    highIndicationCount: string
}

const KEY_TOKENS: KeyColorsType = {
    ['veryLowIndicationCount']: '--chart-1',
    ['lowIndicationCount']: '--chart-2',
    ['midIndicationCount']: '--chart-3',
    ['highIndicationCount']: '--chart-4',
}

const keys = Object.keys(KEY_TOKENS) as (keyof KeyColorsType)[];

export function getKeyColors(): KeyColorsType {
    return {
        veryLowIndicationCount: readToken(KEY_TOKENS.veryLowIndicationCount),
        lowIndicationCount: readToken(KEY_TOKENS.lowIndicationCount),
        midIndicationCount: readToken(KEY_TOKENS.midIndicationCount),
        highIndicationCount: readToken(KEY_TOKENS.highIndicationCount),
    };
}

export function getChartTheme() {
    return {
        text: readToken('--text-subtle'),
        grid: readToken('--chart-grid', readNumericToken('--chart-grid-opacity', 0.1)),
    };
}

export function transformData(data: any) {
    const labels = Object.keys(data);
    const keyColors = getKeyColors();

    const datasets = keys.map((key) => ({
        label: key,
        data: Object.values(data)?.map(item => item[key]),
        borderColor: keyColors[key],
    }));

    return {
        labels,
        datasets
    }
}
