import {Link, useLocation} from "react-router-dom";
import {FC} from "react";
import {isFunction} from "lodash";


type tabInfo = {
    title: string,
    Icon: FC,
    alt: string,
    href: string,
    action?: (pathname: string) => void,
    isShown?: (currentPath: string) => boolean,
}

type Props = {
    tabInfo: tabInfo
}

export default function MobileNavbarTab({ tabInfo }: Props) {
    const { Icon, href, action, isShown } = tabInfo;
    const location = useLocation();

    const isActionButton = isFunction(action) && isFunction(isShown);
    if (isActionButton && isShown(location.pathname)) return (
        <div onClick={() => action(location.pathname)} className={`mobile-navbar-item is-action-button`}>
            <Icon />
        </div>
    );

    return (
        !action && <Link to={href}>
            <div
                className={`mobile-navbar-item ${location.pathname.includes(href) && "mobile-navbar-item-active-tab"}`}>
                <Icon />
            </div>
        </Link>
    );
}