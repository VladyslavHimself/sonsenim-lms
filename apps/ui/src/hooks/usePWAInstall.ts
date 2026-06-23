import React from 'react';


// TODO: Add button to install PWA (UX)
export default function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

    React.useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const installAction = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const {outcome} = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        setDeferredPrompt(null);
    };

    return {deferredPrompt, installAction};
}