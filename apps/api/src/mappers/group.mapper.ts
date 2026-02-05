import {GroupPersistence} from "../models/persistence/Group.persistence";
import {GroupResponse} from "@sonsenim/contracts";

export function getBaseGroupFields(group: GroupPersistence): GroupResponse{
    return {
        id: group.id,
        groupName: group.name
    }
}

export const groupMapper = {
    toGroupDTO(group: GroupPersistence): GroupResponse {
        return getBaseGroupFields(group);
    },

    toGroupDTOList(groups: GroupPersistence[]): GroupResponse[] {
        return groups.map(groupMapper.toGroupDTO);
    }
};