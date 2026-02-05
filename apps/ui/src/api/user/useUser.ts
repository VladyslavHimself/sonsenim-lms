import {useQuery} from "@tanstack/react-query";
import {UserApi} from "@/api";

export default function useUser() {
    const { data: userData, refetch, isLoading } = useQuery({
        queryKey: ['user-info'],
        queryFn: () => UserApi.getLoggedInUserProfile().then(({data}) => data)
    })

    return { userData, refetch, isLoading };
}