import {useMutation} from "@tanstack/react-query";
import {DecksApi} from "@/api/decks/decks.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {DeckResponse} from "@sonsenim/contracts";


export type EditDeckMutationVariables = {
    deckId: string,
    deckConfiguration: DeckResponse
}

export default function useUpdateDeckMutation(callback: Function) {
    const { mutate: updateDeck } = useMutation({
        mutationKey: ['update-deck'],
        mutationFn: ({ deckId, deckConfiguration }: EditDeckMutationVariables) => DecksApi.updateDeck(deckId, deckConfiguration),
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

    return { updateDeck };
}