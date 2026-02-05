import {useMutation} from "@tanstack/react-query";
import {useToast} from "@/components/ui/use-toast.ts";
import {GroupsApi} from "@/api";


export function useDeleteUserGroupMutation(callback: Function) {
    const { toast } = useToast();
    const { mutate: deleteUserGroup } = useMutation({
        mutationKey: ['delete-user-group'],
        mutationFn: (groupId: number) => GroupsApi.deleteUserGroup(groupId),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () =>
            toast({
                variant: 'destructive',
                title: "Cannot delete group",
                description: "Problem while deleting user group"
            })
    });

    return { deleteUserGroup };
}