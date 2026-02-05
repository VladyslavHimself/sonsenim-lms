import {useQuery} from "@tanstack/react-query";
import {GroupsApi} from "@/api";

export default function useUserGroups() {
    const {data: userGroups, isLoading, refetch} = useQuery({
        queryKey: ['user-groups'],
        queryFn: () => GroupsApi.getUserGroups().then(({data}) => data)
        });

    return { userGroups, refetch, isLoading };
};