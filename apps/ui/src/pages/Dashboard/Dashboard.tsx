import '@/styles/layout-wrapper.styles.scss';
import './Dashboard.scss';
import PageHeaderSection from "@/components/Dashboard/DashboardHeaderSection/PageHeaderSection.tsx";
import DashboardContentSection from "@/components/Dashboard/DashboardContentSection/DashboardContentSection.tsx";
import useUserGroups from "@/api/groups/useUserGroups.ts";
import {Combobox} from "@/components/ui/combobox.tsx";
import useGroupSelection from "@/pages/Dashboard/useGroupSelection.ts";
import { useMediaQuery } from 'react-responsive'
import PageHeaderSectionTitle from "@/components/Dashboard/DashboardHeaderSection/PageHeaderSectionTitle/PageHeaderSectionTitle.tsx";

export default function Dashboard() {
    const isMobile = useMediaQuery({query: "(max-width: 700px)"});
    const { userGroups } = useUserGroups();
    const { selectedGroup, groupsSelectionList, onSelectGroup } = useGroupSelection(userGroups!);
    return (
        <div className="layout-wrapper">
            <PageHeaderSection>
                {
                    isMobile ? <PageHeaderSectionTitle>Dashboard</PageHeaderSectionTitle>
                        : <div style={{width: 300}}>
                            <Combobox
                                selectedValue={selectedGroup}
                                placeholder="Select group..."
                                searchPlaceholder="Search group.."
                                onChangeValue={onSelectGroup}
                                selectionList={groupsSelectionList || []}
                            />
                        </div>
                }

            </PageHeaderSection>

            {
                isMobile && <div style={{ marginTop: "15px"}}>
                    <Combobox
                        selectedValue={selectedGroup}
                        placeholder="Select group..."
                        searchPlaceholder="Search group.."
                        onChangeValue={onSelectGroup}
                        selectionList={groupsSelectionList || []}
                    />
                </div>
            }

            <DashboardContentSection selectedGroup={selectedGroup} />
        </div>
    );
}