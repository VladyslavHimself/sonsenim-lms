import {useMutation} from "@tanstack/react-query";
import {CardsApi} from "@/api";
import {toast} from "@/components/ui/use-toast.ts";
import {ImportCardsConfigurationBody} from "@sonsenim/contracts";
import {getAsyncStatus} from "@/api/getAsyncStatusFn.ts";

type CardConfigurationVariables = {
    deckId: string,
    cards: ImportCardsConfigurationBody
}

export default function useImportNewCardsMutation(callback: Function) {
    const {mutate: importNewCards, isIdle, isError, isSuccess, isPending} = useMutation({
        mutationKey: ['import-cards-to-deck'],
        mutationFn: (variables: CardConfigurationVariables) => {
            return CardsApi.importCardsToDeck(variables.deckId, variables.parsedCards);
        },
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () => toast({
            variant: "destructive",
            title: "Cards import failed",
            description: "Can't imoprt cards, please try again later"
        })
    });

    const asyncStatus = getAsyncStatus(isIdle, isPending, isError, isSuccess);

    return {importNewCards, asyncStatus};
}