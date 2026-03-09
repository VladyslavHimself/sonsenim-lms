
export const keyColors: KeyColorsType = {
    ['veryLowIndicationCount']: "#6ED132",
    ["lowIndicationCount"]: "#E82626",
    ["midIndicationCount"]: "#E1BD00",
    ["highIndicationCount"]: "#9D00D5",
}

type KeyColorsType = {
    veryLowIndicationCount: string,
    lowIndicationCount: string,
    midIndicationCount: string,
    highIndicationCount: string
}

const keys = Object.keys(keyColors) as (keyof KeyColorsType)[];


export function transformData(data: any) {
    const labels = Object.keys(data);

    const datasets = keys.map((key) => ({
        label: key,
        data: Object.values(data)?.map(item  => item[key]),
        borderColor: keyColors[key],
    }));

    return {
        labels,
        datasets
    }
}