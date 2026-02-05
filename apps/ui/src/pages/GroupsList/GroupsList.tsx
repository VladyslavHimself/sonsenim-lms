import '@/styles/layout-wrapper.styles.scss';
import '@/styles/GroupsList.scss';
import PageHeaderSection from "@/components/Dashboard/DashboardHeaderSection/PageHeaderSection.tsx";
import {Input} from "@/components/ui/input.tsx";
import CardsListContentSection from "@/components/Groups/GroupsListContentSection/CardsListContentSection.tsx";
import useUserGroupsInfo from "@/api/groups/useUserGroupsInfo.ts";
import {useNavigate} from "react-router-dom";
import Card from "@/components/Card/Card.tsx";
import {UserGroupsInfoResponse} from "@/api/groups/groups.ts";
import React, {useState} from "react";
import useQuicksearch from "@/hooks/useQuicksearch.ts";
import {useMediaQuery} from "react-responsive";
import PageHeaderSectionTitle
    from "@/components/Dashboard/DashboardHeaderSection/PageHeaderSectionTitle/PageHeaderSectionTitle.tsx";
import GroupsListDesktopContentHeader from "@/pages/GroupsList/GroupsListDesktopContentHeader.tsx";
import {Modal} from "@/ModalBox/modalBox.ts";
import {EditGroupModal} from "@/components/Modals/GroupModals/EditGroupModal.tsx";

export default function GroupsList() {
    const isMobile = useMediaQuery({query: "(max-width: 700px)"});
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const {groupsInfo, refetch} = useUserGroupsInfo();
    const filteredGroups = useQuicksearch<UserGroupsInfoResponse>(groupsInfo!, ['groupName'], searchInput);


    // TODO: Make context for header || HARDCODED
    const ContentSectionHeader = isMobile ? MobileSearchbar
        : GroupsListDesktopContentHeader;

    return (
        <div className="layout-wrapper">
            <PageHeaderSection>
                {!isMobile && <div className="groups-header-section">
                    <Input value={searchInput} onChange={(e) => {
                        setSearchInput(e.target?.value);
                    }} placeholder="Search" className="groups-header-input"/>
                </div> || <PageHeaderSectionTitle>Groups</PageHeaderSectionTitle>}
            </PageHeaderSection>
            <CardsListContentSection searchInput={searchInput} setSearchInput={setSearchInput}
                                     Header={ContentSectionHeader}>
                {
                    // TODO: Add template (design), if user haven't any groups here
                    filteredGroups?.map((currentGroup) => {
                        const {groupId, groupName, decksCount} = currentGroup;
                        return (
                            <Card
                                key={groupId}
                                cardTitle={groupName}
                                secondaryTile={<div>{`${decksCount} decks`}</div>}
                                onClickHandler={() => openGroupByGroupId(groupId, groupName)}
                                onEditHandler={(e) =>
                                    onEditGroupHandle(e, currentGroup)}
                                imageSrc={'test'}
                            />
                        );
                    })
                }
            </CardsListContentSection>
        </div>
    );

    function onEditGroupHandle(
        e: React.MouseEvent<SVGSVGElement, MouseEvent>,
        currentGroup: UserGroupsInfoResponse
    ) {
        e.stopPropagation();
        Modal.open((modal) =>
            <EditGroupModal modal={modal} currentGroup={currentGroup} refetchGroups={refetch}/>,
            `Edit group ${currentGroup.groupName}`, 'admin-confirmation'
        )
    }

    function openGroupByGroupId(groupId: number, groupName: string) {
        // TODO: Make url by key generator
        navigate(`/groups/${groupId}`, {
            state: {groupName}
        });
    }
}


function MobileSearchbar({searchInput, setSearchInput}: any) {

    return <div className="groups-header-section">
        <Input value={searchInput} onChange={(e) => {
            setSearchInput(e.target?.value);
        }} placeholder="Search" className="groups-header-input"/>
    </div>
}