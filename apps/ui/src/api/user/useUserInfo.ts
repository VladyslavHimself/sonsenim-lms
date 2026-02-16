import {useQuery} from "@tanstack/react-query";
import {UserApi} from "@/api";

export default function useUserInfo() {
    const { data: userInfo, refetch, isLoading } = useQuery({
        queryKey: ['user-info-me'],
        retry: false,
        queryFn: () => UserApi.getUserInfo()
            .then(({data}) => data)
    });

    console.log(isLoading);

    return { userInfo, refetch, isLoading }
}