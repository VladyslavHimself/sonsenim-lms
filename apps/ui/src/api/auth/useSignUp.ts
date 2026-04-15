import {useMutation} from "@tanstack/react-query";
import {AuthApi} from "@/api/auth/auth.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {RegistrationUserBody} from "@sonsenim/contracts";
import {getAsyncStatus} from "@/api/getAsyncStatusFn.ts";


export default function useSignUp(callback: Function) {
    const { toast } = useToast()
    const { mutate: registerUser, isError, isIdle, isPending, isSuccess} = useMutation({
        mutationKey: ['user-auth'],
        mutationFn: (credentials: RegistrationUserBody) => AuthApi.registerUser(credentials).then(({data}) => data),
    onSuccess: (data, variables, context) => {
            callback(data, variables, context);
    },
    onError: () =>
        toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Registration failed, please try again later"
        })
    });

    const asyncStatus = getAsyncStatus(isIdle, isPending, isError, isSuccess);

    return { registerUser, asyncStatus };
}