import './NavSidebar.scss';
import Logotype from '@/assets/logo.png';
import NavSidebarList from "@/pages/Navigation/NavSidebar/NavSidebarList/NavSidebarList.tsx";
import { useState } from "react";

function NavSidebar() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

    return (
        <div className={`nav-sidebar ${isSidebarCollapsed && "nav-sidebar--collapsed"}`}>
            <div className="nav-sidebar-logo">
                <img src={Logotype} alt="logotype"/>
                <hr/>
            </div>
        <NavSidebarList isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
        </div>
    );
}

export default NavSidebar;