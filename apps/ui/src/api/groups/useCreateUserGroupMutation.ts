import {useMutation} from "@tanstack/react-query";
import {useToast} from "@/components/ui/use-toast.ts";
import {GroupsApi} from "@/api";
import {getAsyncStatus} from "@/api/getAsyncStatusFn.ts";


export function useCreateUserGroupMutation(callback: Function) {
    const {toast} = useToast();
    const {mutate: createUserGroup, isError, isIdle, isPending, isSuccess} = useMutation({
        mutationKey: ['create-user-group'],
        mutationFn: (groupName: string) => GroupsApi.addUserGroup(groupName),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () =>
            // TODO: Make ToastManager
            toast({
                variant: 'destructive',
                title: "Group creation failed",
                description: "Group not created, please try again later"
            })
    });

    const asyncStatus = getAsyncStatus(isIdle, isPending, isError, isSuccess);

    return {createUserGroup, asyncStatus};
}