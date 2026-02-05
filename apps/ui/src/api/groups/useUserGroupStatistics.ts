import {useQuery} from "@tanstack/react-query";
import {GroupsApi} from "@/api";

export default function useUserGroupStatistics(groupId: number) {
    const {data: groupStats, isLoading, refetch} = useQuery({
        queryKey: ['user-group-stats', groupId],
        queryFn: () => GroupsApi.getGroupStatistics(groupId).then(({data}) => data)
    });

    return { groupStats, refetch, isLoading };
};