import {useQuery} from "@tanstack/react-query";
import {GroupsApi} from "@/api";

export default function useUserGroupsInfo() {
    const { data: groupsInfo, isLoading, refetch} = useQuery({
        queryKey: ['user-groups-info'],
        queryFn: () => GroupsApi.getUserGroupsInfo().then(({ data }) => data)
    })

    return { groupsInfo, refetch, isLoading };
};