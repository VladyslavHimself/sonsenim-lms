export function increaseInterval(intervalPattern: number[], currentInterval: number) {
    for (const i of intervalPattern) {
        if (currentInterval < i) return i;
    }
    return intervalPattern.at(-1);
}
export function decreaseInterval(interval: number, minInterval: number) {
    if (interval === 0) return minInterval;
    return Math.max(minInterval, interval / 2);
}
export function convertIntervalToDate(interval: number) {
    const HOURS_IN_DAY = 24;
    const MS_IN_HOUR = 60 * 60 * 1000;

    const now = Date.now();

    if (interval <= 0) {
        throw new Error('Interval must be > 0');
    }

    if (interval < 1) {
        return new Date(now + interval * HOURS_IN_DAY * MS_IN_HOUR);
    }

    return new Date(now + interval * HOURS_IN_DAY * MS_IN_HOUR);
}