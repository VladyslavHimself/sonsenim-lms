import {Outlet} from "react-router-dom";
import NavSidebar from "@/pages/Navigation/NavSidebar/NavSidebar.tsx";
import useNavigationStatus from "@/pages/Navigation/NavSidebar/useNavigationStatus.tsx";
import useMediaQuery from "@/hooks/useMediaQuery.ts";
import MobileNavbar from "@/pages/Navigation/MobileNavbar/MobileNavbar.tsx";
import React from "react";

let deferredPrompt;

export default function Navbar() {
    const isNavbarShouldBeShown = useNavigationStatus();
    const isMobileResolution = useMediaQuery("(max-width: 600px)");
    const Navigation = isMobileResolution ? MobileNavbar : NavSidebar;

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('install') === 'true') {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                console.log('installfired');

                if (urlParams.get('install') === 'true') {
                    deferredPrompt.prompt();
                }
            });
        }
        return () => window.removeEventListener('beforeinstallprompt', (e) => deferredPrompt = e);

    }, [])

    return (
        <>
            {isNavbarShouldBeShown && <Navigation/>}
            <Outlet/>
        </>
    );
};