const EIGHT_HOURS = 0.4;
const SEVEN_DAYS = 7;
const NINETY_DAYS = 90;

export type IntervalLevels = 'Very low' | 'Low' | 'Medium' | 'High';

export function resolveStrengthLevel(intervalStrengthTime: number): IntervalLevels {
    if (intervalStrengthTime < EIGHT_HOURS) return "Very low";
    if (intervalStrengthTime < SEVEN_DAYS) return "Low";
    if (intervalStrengthTime < NINETY_DAYS) return "Medium";
    return "High";
}

// const intervalNums = {
//     [0]: 'Now',
//     [0.125]: '3 hours',
//     [0.25]: '6 hours',
//     [0.5]: '12 hours',
// } as const;
//
// type IntervalNumsValues = keyof typeof intervalNums;

export function resolveIntervalStrValues(intervalStrength: number) {
    if (intervalStrength < 1) {
        return `${intervalStrength * 24}hrs`
    }

    return `${intervalStrength} days`;

    // return intervalNums[intervalStrength] || `${intervalStrength} days`;
}