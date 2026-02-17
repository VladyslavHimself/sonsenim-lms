import {GroupConfigurationBody} from "@sonsenim/contracts";
import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {axiosInstances} from "@/api/axiosInstances.ts";

export type UserGroupResponse = {
    id: number,
    groupName: string
}

export type UserGroupsStatisticsResponse = {
    decksTotal: number,
    cardsTotal: number,
}

export type UserGroupsInfoResponse = {
    groupId: number,
    groupName: string,
    decksCount: number
}

const GroupsApi = {
    getUserGroups() {
        return axiosInstances.get<UserGroupResponse[]>(`${RESOURCE_SERVER_URL}/api/groups/`);
    },

    getGroupStatistics(groupId: number) {
        return axiosInstances.get<UserGroupsStatisticsResponse>(`${RESOURCE_SERVER_URL}/api/groups/stats/${groupId}`);
    },

    getUserGroupsInfo() {
        return axiosInstances.get<UserGroupsInfoResponse[]>(`${RESOURCE_SERVER_URL}/api/groups/user-groups-info`);
    },

    addUserGroup(groupName: string) {
        return axiosInstances.post(`${RESOURCE_SERVER_URL}/api/groups/${groupName}`);
    },

    deleteUserGroup(groupId: number) {
        return axiosInstances.delete(`${RESOURCE_SERVER_URL}/api/groups/${groupId}`);
    },

    updateUserGroup(groupId: number, groupConfiguration: GroupConfigurationBody) {
        return axiosInstances.put<UserGroupResponse>(`${RESOURCE_SERVER_URL}/api/groups/${groupId}`, groupConfiguration);
    }

};

export default GroupsApi;