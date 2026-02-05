import {useMutation} from "@tanstack/react-query";
import {AuthApi} from "@/api/auth/auth.ts";
import {useToast} from "@/components/ui/use-toast.ts";


export default function useLogout(callback: Function) {
    const {toast} = useToast();
    const {mutate: logoutUser} = useMutation({
        mutationKey: ['logout-user'],
        mutationFn: () => AuthApi.logoutUser().then(({data}) => data),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () =>
            toast({
                variant: "destructive",
                title: "Logout failed",
                description: "Logout failed!"
            })
    });

    return {logoutUser};
}