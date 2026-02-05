import {useMutation} from "@tanstack/react-query";
import {CardsApi} from "@/api";
import {toast} from "@/components/ui/use-toast.ts";
import {CardConfigurationBody} from "@sonsenim/contracts";

type CardConfigurationVariables = {
    deckId: number,
    cardConfiguration: CardConfigurationBody
}

export default function useAddNewCardMutation(callback: Function) {
    const { mutate: addNewCard } = useMutation({
        mutationKey: ['add-new-card'],
        mutationFn: (variables: CardConfigurationVariables) =>
            CardsApi.addCardToDeck(variables.deckId, variables.cardConfiguration),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () => toast({
            variant: "destructive",
            title: "Card creation failed",
            description: "Can't create card, please try again later"
        })
    });

    return { addNewCard };
}