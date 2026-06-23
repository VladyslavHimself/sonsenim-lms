import {useMutation} from "@tanstack/react-query";
import {useToast} from "@/components/ui/use-toast.ts";
import {GroupsApi} from "@/api";
import {GroupConfigurationBody} from "@sonsenim/contracts";
import {getAsyncStatus} from "@/api/getAsyncStatusFn.ts";

type MutationParams = {
    groupId: number,
    groupBody: GroupConfigurationBody
}

export function useUpdateUserGroupMutation(callback: Function) {
    const {toast} = useToast();
    const {mutate: updateUserGroup, isError, isIdle, isPending, isSuccess} = useMutation({
        mutationKey: ['update-user-group'],
        mutationFn: ({
                         groupId,
                         groupBody
                     }: MutationParams) => GroupsApi.updateUserGroup(groupId, groupBody).then(({data}) => data),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () =>
            toast({
                variant: 'destructive',
                title: "Group edit failed",
                description: "Error while editing user group"
            })
    });

    const asyncStatus = getAsyncStatus(isIdle, isPending, isError, isSuccess);

    return {updateUserGroup, asyncStatus};
}