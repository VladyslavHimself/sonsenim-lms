import {useMutation} from "@tanstack/react-query";
import {DecksApi} from "@/api/decks/decks.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {DeckResponse} from "@sonsenim/contracts";
import {getAsyncStatus} from "@/api/getAsyncStatusFn.ts";


export type EditDeckMutationVariables = {
    deckId: string,
    deckConfiguration: DeckResponse
}

export default function useUpdateDeckMutation(callback: Function) {
    const {mutate: updateDeck, isIdle, isPending, isError, isSuccess} = useMutation({
        mutationKey: ['update-deck'],
        mutationFn: ({
                         deckId,
                         deckConfiguration
                     }: EditDeckMutationVariables) => DecksApi.updateDeck(deckId, deckConfiguration),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () =>
            toast({
                variant: 'destructive',
                title: "Deck update failed",
                description: "Deck not updated, please try again later"
            })
    });

    const asyncStatus = getAsyncStatus(isIdle, isPending, isError, isSuccess);

    return {updateDeck, asyncStatus};
}