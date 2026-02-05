import {UserGroupResponse} from "@/api/groups/groups.ts";
import {useEffect, useMemo, useState} from "react";
import {SelectionItem} from "@/components/ui/combobox.tsx";
import {isEmpty} from "lodash";

export default function useGroupSelection(userGroups: UserGroupResponse[] = []) {
    const [selectedGroup, setSelectedGroup] = useState<SelectionItem>(
       JSON.parse(localStorage.getItem("selectedGroup")!) || []
    );

    const groupsSelectionList: SelectionItem[]  = useMemo(() => userGroups?.map(item => ({
        value: item.id,
        label: item.groupName
})), [userGroups]);

    useEffect(() => {
        if (isEmpty(groupsSelectionList)) {
            localStorage.removeItem('selectedGroup');
        }

        if (isEmpty(selectedGroup) && groupsSelectionList.length) {
            onSelectGroup(groupsSelectionList[0])
        }


        if (!isEmpty(groupsSelectionList) && isSelectedGroupExists(groupsSelectionList, selectedGroup)) {
            onSelectGroup(groupsSelectionList[0])
        }


    }, [groupsSelectionList, selectedGroup]);

    return { selectedGroup, groupsSelectionList, onSelectGroup };


    function onSelectGroup(_selectedGroup: SelectionItem | null) {
        if (_selectedGroup) {
            setSelectedGroup(_selectedGroup);
            localStorage.setItem('selectedGroup', JSON.stringify(_selectedGroup));
        }
    }

    function isSelectedGroupExists(list: SelectionItem[], selectedGroup: SelectionItem) {
        return !list?.find(item => item.value === selectedGroup.value);
    }
}