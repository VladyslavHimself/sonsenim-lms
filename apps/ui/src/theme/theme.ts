export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Background used for the browser chrome (address bar / PWA splash). */
const THEME_COLOR: Record<ResolvedTheme, string> = {
    light: '#F4F4F4',
    dark: '#15181E',
};

export function isTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark' || value === 'system';
}

export function readStoredTheme(): Theme {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return isTheme(stored) ? stored : 'system';
    } catch {
        // Private mode / storage disabled — fall back to the system preference.
        return 'system';
    }
}

export function storeTheme(theme: Theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Persistence is best-effort; the in-memory theme still applies.
    }
}

export function getSystemTheme(): ResolvedTheme {
    return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

export function resolveTheme(theme: Theme): ResolvedTheme {
    return theme === 'system' ? getSystemTheme() : theme;
}

export function applyTheme(resolved: ResolvedTheme) {
    const root = document.documentElement;

    root.classList.toggle('dark', resolved === 'dark');
    // Lets the UA style native widgets (scrollbars, form controls, spellcheck).
    root.style.colorScheme = resolved;

    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', THEME_COLOR[resolved]);
}

export function subscribeToSystemTheme(onChange: (resolved: ResolvedTheme) => void) {
    const media = window.matchMedia?.(DARK_QUERY);
    if (!media) return () => {};

    const handler = (event: MediaQueryListEvent) => onChange(event.matches ? 'dark' : 'light');
    media.addEventListener('change', handler);

    return () => media.removeEventListener('change', handler);
}
