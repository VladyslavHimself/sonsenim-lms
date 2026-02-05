import {useMutation} from "@tanstack/react-query";
import {CardsApi} from "@/api";
import {toast} from "@/components/ui/use-toast.ts";

type RemoveCardVariables = {
    cardId: string;
    deckId: string,
}

export default function useRemoveCardMutation(callback: Function) {
    const { mutate: removeCard } = useMutation({
        mutationKey: ['remove-existing-card'],
        mutationFn: (variables: RemoveCardVariables) =>
            CardsApi.removeCardFromDeck(variables.deckId, variables.cardId),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () => toast({
            variant: "destructive",
            title: "Card deletion failed",
            description: "Can't delete card, please try again later"
        })
    });

    return { removeCard };
}