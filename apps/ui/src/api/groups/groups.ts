import {GroupConfigurationBody} from "@sonsenim/contracts";
import {RESOURCE_SERVER_URL} from "@/constants/resource.ts";
import {axiosInstance} from "@/api/axiosInstance.ts";

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
        return axiosInstance.get<UserGroupResponse[]>(`${RESOURCE_SERVER_URL}/api/groups/`);
    },

    getGroupStatistics(groupId: number) {
        return axiosInstance.get<UserGroupsStatisticsResponse>(`${RESOURCE_SERVER_URL}/api/groups/stats/${groupId}`);
    },

    getUserGroupsInfo() {
        return axiosInstance.get<UserGroupsInfoResponse[]>(`${RESOURCE_SERVER_URL}/api/groups/user-groups-info`);
    },

    addUserGroup(groupName: string) {
        return axiosInstance.post(`${RESOURCE_SERVER_URL}/api/groups/${groupName}`);
    },

    deleteUserGroup(groupId: number) {
        return axiosInstance.delete(`${RESOURCE_SERVER_URL}/api/groups/${groupId}`);
    },

    updateUserGroup(groupId: number, groupConfiguration: GroupConfigurationBody) {
        return axiosInstance.put<UserGroupResponse>(`${RESOURCE_SERVER_URL}/api/groups/${groupId}`, groupConfiguration);
    }

};

export default GroupsApi;