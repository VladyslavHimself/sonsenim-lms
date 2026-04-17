import {useMutation} from "@tanstack/react-query";
import {AuthApi} from "@/api/auth/auth.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {LoginUserBody} from "@sonsenim/contracts";
import {getAsyncStatus} from "@/api/getAsyncStatusFn.ts";


export default function useSignIn(callback: Function) {
    const {toast} = useToast()
    const {
        mutate: loginUser,
        data: userToken,
        isIdle: isIdleStatus,
        isPending,
        isError,
        isSuccess,
    } = useMutation({
        mutationKey: ['user-auth'],
        mutationFn: function (credentials: LoginUserBody) {
            return AuthApi.loginUser(credentials).then((data) => ({...data}));
        },
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: (error) => {
            // @ts-expect-error response provided
            const {data, status} = error['response'];

            if (`${status}`.startsWith("4")) {
                toast({
                    variant: "destructive",
                    title: `${data}`,
                    description: `Authorization failed: ${data}`
                })

                return;
            }


            toast({
                variant: "destructive",
                title: "Authorization failed",
                description: "There was a problem with your request. Please try again later."
            })
        }
    });

    const asyncStatus = getAsyncStatus(isIdleStatus, isPending, isError, isSuccess);

    return {loginUser, asyncStatus, userToken};
}