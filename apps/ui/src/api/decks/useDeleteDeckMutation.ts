import {useMutation} from "@tanstack/react-query";
import {DecksApi} from "@/api/decks/decks.ts";
import {toast} from "@/components/ui/use-toast.ts";


export default function useDeleteDeckMutation(callback: Function) {
    const { mutate: deleteDeck } = useMutation({
        mutationKey: ['delete-deck'],
        mutationFn: (deckId: number) => DecksApi.deleteDeck(deckId),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () =>
            toast({
                variant: 'destructive',
                title: "Deck creation failed",
                description: "Deck not created, please try again later"
            })
    })

    return { deleteDeck };
}