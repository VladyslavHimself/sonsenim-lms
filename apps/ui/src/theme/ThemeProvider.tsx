import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
    applyTheme,
    readStoredTheme,
    resolveTheme,
    ResolvedTheme,
    storeTheme,
    subscribeToSystemTheme,
    Theme,
} from "@/theme/theme.ts";

type ThemeContextValue = {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(readStoredTheme()));

    useEffect(() => {
        const resolved = resolveTheme(theme);
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, [theme]);

    // Only track the OS while the user hasn't pinned an explicit choice.
    useEffect(() => {
        if (theme !== 'system') return;

        return subscribeToSystemTheme((resolved) => {
            setResolvedTheme(resolved);
            applyTheme(resolved);
        });
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        storeTheme(next);
        setThemeState(next);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(resolveTheme(readStoredTheme()) === 'dark' ? 'light' : 'dark');
    }, [setTheme]);

    const value = useMemo(
        () => ({theme, resolvedTheme, setTheme, toggleTheme}),
        [theme, resolvedTheme, setTheme, toggleTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}
