import PageHeaderSection from "@/components/Dashboard/DashboardHeaderSection/PageHeaderSection.tsx";
import './Profile.scss';
import {CircleUserRound} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import ContentCard from "@/components/ContentCard/ContentCard.tsx";
import useUser from "@/api/user/useUser.ts";
import dayjs from "dayjs";
import {useMediaQuery} from "react-responsive";
import PageHeaderSectionTitle
    from "@/components/Dashboard/DashboardHeaderSection/PageHeaderSectionTitle/PageHeaderSectionTitle.tsx";

export default function Profile() {
    const isMobile = useMediaQuery({query: "(max-width: 700px)"});
    const { userData } = useUser();
    const { firstName, lastName, email, totalDecks, totalCards, createdAt } = userData || {};

    return (
        <div className="layout-wrapper profile-page">
            <PageHeaderSection>
                {!isMobile ? <div className="profile-page-user-header">
                    <div className="user-info-avatar"><CircleUserRound type="filled"/></div>
                    <div className="user-info-content">
                        <div className="user-info-content-fullname">{`${firstName} ${lastName}`}</div>
                        <div className="user-info-content-email">{email || '-'}</div>
                    </div>
                </div> : <PageHeaderSectionTitle>Profile</PageHeaderSectionTitle>}
            </PageHeaderSection>

            {
                isMobile && <div className="profile-page-user-header">
                    <div className="user-info-avatar"><CircleUserRound type="filled"/></div>
                    <div className="user-info-content">
                        <div className="user-info-content-fullname">{`${firstName} ${lastName}`}</div>
                        <div className="user-info-content-email">{email || '-'}</div>
                    </div>
                </div>
            }
            <div className="profile-page-group-section">
                <div className="profile-page-group-section-header">Subscription details</div>
                <div className="profile-page-group-section-content">
                    <div>
                        <div className="profile-page-group-section-item">Current tier - <span>free</span></div>
                        <div className="profile-page-group-section-item">During - <span>lifetime</span></div>
                    </div>
                    <Button className="profile-page-group-premium-button">Buy premium</Button>
                </div>
            </div>
            <div className="profile-page-content-strip">
                <ContentCard title="Member since" information={dayjs(createdAt).format("YYYY/MM/DD")}/>
                <ContentCard title="Total decks" information={totalDecks?.toString()}/>
                <ContentCard title="Total cards" information={totalCards?.toString()}/>
            </div>
        </div>
    );
}