import {useMutation} from "@tanstack/react-query";
import {CardsApi} from "@/api";
import {toast} from "@/components/ui/use-toast.ts";
import {CardConfigurationBody} from "@sonsenim/contracts";

type CardConfigurationVariables = {
    cardId: string;
    deckId: string,
    cardConfiguration: CardConfigurationBody

}

export default function useEditCardMutation(callback: Function) {
    const { mutate: updateCardMutation } = useMutation({
        mutationKey: ['edit-existing-card'],
        mutationFn: (variables: CardConfigurationVariables) =>
            CardsApi.updateCard(variables.cardId, variables.deckId, variables.cardConfiguration),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () => toast({
            variant: "destructive",
            title: "Card editing failed",
            description: "Can't edit card, please try again later"
        })
    });

    return { updateCardMutation };
}