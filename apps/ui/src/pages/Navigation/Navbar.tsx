import {Outlet} from "react-router-dom";
import NavSidebar from "@/pages/Navigation/NavSidebar/NavSidebar.tsx";
import useNavigationStatus from "@/pages/Navigation/NavSidebar/useNavigationStatus.tsx";
import useMediaQuery from "@/hooks/useMediaQuery.ts";
import MobileNavbar from "@/pages/Navigation/MobileNavbar/MobileNavbar.tsx";

export default function Navbar() {
    const isNavbarShouldBeShown = useNavigationStatus();
    const isMobileResolution = useMediaQuery("(max-width: 600px)");
    const Navigation = isMobileResolution ? MobileNavbar : NavSidebar;


    return (
        <>
            {isNavbarShouldBeShown && <Navigation />}
            <Outlet />
        </>
    );
};