import HomeIcon from "@/assets/Icons/Home.svg";
import GroupsIcon from "@/assets/Icons/Groups.svg";
import LeftArrow from "@/assets/Icons/LeftArrow.svg";
import RightArrow from "@/assets/Icons/RightArrow.svg";
import LogoutIcon from "@/assets/Icons/Logout.svg";
import {Link, useLocation, useNavigate} from "react-router-dom";
import React, {useMemo} from "react";
import useLogout from "@/api/auth/useLogout.ts";
import {useQueryClient} from "@tanstack/react-query";
import ThemeToggle from "@/theme/ThemeToggle.tsx";

const TOP_NAVLINKS = [
    {
        title: "Dashboard",
        icon: HomeIcon,
        alt: "home-icon",
        href: "/dashboard"
    },

    {
        title: "Groups",
        icon: GroupsIcon,
        alt: "groups-icon",
        href: "/groups"
    }

];
// @ts-ignore
const BOTTOM_NAVLINKS = (actions, states) => [
    {
        title: "Hide panel",
        icon: states.isSidebarCollapsed ? RightArrow : LeftArrow,
        alt: "hide-panel",
        action: actions.collapseSidebar
    },
    {
        title: "Log out",
        icon: LogoutIcon,
        alt: "logout-icon",
        action: actions.logout
    }
];


export default function NavSidebarList(
    { setIsSidebarCollapsed, isSidebarCollapsed }: {isSidebarCollapsed: boolean, setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>})
{
    const queryClient = useQueryClient();
    const location = useLocation();
    const navigate = useNavigate();
    const { logoutUser } = useLogout(() => {
        localStorage.removeItem('selectedGroup');
        queryClient.removeQueries();
        queryClient.invalidateQueries({queryKey: ['user-info-me']}).then(r => r);
        window.location.reload();
    });

    return useMemo(() => (
        <div className="nav-sidebar-list">
            <div>
                {
                    TOP_NAVLINKS.map(({title, icon, alt, href}) => (
                        <Link to={href}>
                            <div
                                className={`nav-sidebar-item ${location.pathname.includes(href) && "nav-sidebar-item--active"}`}>
                                <img className="icon-adaptive" src={icon} alt={alt}/>
                                <span>{title}</span>
                            </div>
                        </Link>
                    ))
                }
            </div>
            <div>
                <ThemeToggle className="nav-sidebar-item" showLabel={!isSidebarCollapsed}/>
                {
                    BOTTOM_NAVLINKS({logout: logoutUser, collapseSidebar},
                        {isSidebarCollapsed}).map(({title, icon, alt, action}) => (
                        <div className="nav-sidebar-item" onClick={action}>
                            <img className="icon-adaptive" src={icon} alt={alt}/>
                            <span>{title}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    ), [logoutUser, collapseSidebar, isSidebarCollapsed, location.pathname]);


    function collapseSidebar() {
        setIsSidebarCollapsed((prevState) => !prevState)
    }
};