import { PropsWithChildren } from "react";
import './PageHeaderSection.scss';
import AvatarProfile from "@/components/AvatarProfile/AvatarProfile.tsx";


// TODO: REMINDER:
//  Scale group local storage flow. Possible issue is conflict of saved local data when user switch to another one
//  Add group autoselection if group not selected. (if user have, at least one group)


export default function PageHeaderSection({ children }: PropsWithChildren) {
    return (
        <div className="page-header-section">
            <div className="page-header-left-corner">
                {children}
            </div>
            <AvatarProfile />
        </div>
    );
};