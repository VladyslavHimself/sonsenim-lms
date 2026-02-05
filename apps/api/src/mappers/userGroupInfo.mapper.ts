import {GroupPersistence} from "../models/persistence/Group.persistence";
import {getBaseGroupFields} from "./group.mapper";

type UserGroupInfoDTO = {
    group: GroupPersistence,
    decksCount: number
}

export default function userGroupInfoMapper() {
    function toUserGroupInfoDTO({ group, decksCount }: UserGroupInfoDTO) {
        return {
            ...getBaseGroupFields(group),
            decksCount: decksCount,
        };
    }

    return {toUserGroupInfoDTO}
};

