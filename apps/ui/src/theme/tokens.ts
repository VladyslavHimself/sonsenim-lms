/**
 * Reads a design token off the document root.
 *
 * Tokens are stored as bare HSL components (`30 88% 56%`) so CSS can compose
 * them with alpha; anything consuming them from JS has to wrap them itself.
 */
export function readToken(name: string, alpha?: number): string {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!raw) return 'transparent';

    return alpha === undefined ? `hsl(${raw})` : `hsl(${raw} / ${alpha})`;
}

export function readNumericToken(name: string, fallback: number): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(raw);

    return Number.isNaN(parsed) ? fallback : parsed;
}
