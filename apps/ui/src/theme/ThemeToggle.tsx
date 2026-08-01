import {Moon, Sun} from "lucide-react";
import {useTheme} from "@/theme/ThemeProvider.tsx";

type Props = {
    /** Hidden in the collapsed sidebar, same as the other nav labels. */
    showLabel?: boolean;
    className?: string;
};

export default function ThemeToggle({showLabel = true, className = ''}: Props) {
    const {resolvedTheme, toggleTheme} = useTheme();
    const isDark = resolvedTheme === 'dark';
    const label = isDark ? 'Light mode' : 'Dark mode';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={className}
            aria-label={label}
            aria-pressed={isDark}
            title={label}
        >
            {isDark ? <Sun size={24}/> : <Moon size={24}/>}
            {showLabel && <span>{label}</span>}
        </button>
    );
}
