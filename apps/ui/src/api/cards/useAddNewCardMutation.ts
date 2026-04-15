import {useMutation} from "@tanstack/react-query";
import {CardsApi} from "@/api";
import {toast} from "@/components/ui/use-toast.ts";
import {CardConfigurationBody} from "@sonsenim/contracts";
import {getAsyncStatus} from "@/api/getAsyncStatusFn.ts";

type CardConfigurationVariables = {
    deckId: number,
    cardConfiguration: CardConfigurationBody
}

export default function useAddNewCardMutation(callback: Function) {
    const {mutate: addNewCard, isIdle, isError, isSuccess, isPending} = useMutation({
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

    const asyncStatus = getAsyncStatus(isIdle, isPending, isError, isSuccess);

    return {addNewCard, asyncStatus};
}