import {useMutation} from "@tanstack/react-query";
import {DecksApi} from "@/api/decks/decks.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {DeckConfigurationBody} from "@sonsenim/contracts";
import {getAsyncStatus} from "@/api/getAsyncStatusFn.ts";


export default function useAddDeckToGroupMutation(callback: Function) {
    const {mutate: addDeckToGroup, isIdle, isError, isSuccess, isPending} = useMutation({
        mutationKey: ['add-deck-to-group'],
        mutationFn: (variables: { groupId: string, deckConfiguration: DeckConfigurationBody }) =>
            DecksApi.addDeckToGroup(variables.groupId, variables.deckConfiguration).then(({data}) => data),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () =>
            toast({
                variant: 'destructive',
                title: "Deck creation failed",
                description: "Deck not created, please try again later"
            })
    });

    const asyncStatus = getAsyncStatus(isIdle, isPending, isError, isSuccess);

    return {addDeckToGroup, asyncStatus};
};