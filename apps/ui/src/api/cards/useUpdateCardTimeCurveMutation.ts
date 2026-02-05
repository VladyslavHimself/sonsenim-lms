import {useMutation} from "@tanstack/react-query";
import {CardsApi} from "@/api";
import {toast} from "@/components/ui/use-toast.ts";
import {UpdateCurveConfigurationBody} from "@sonsenim/contracts";

type UpdateCardTimeCurveConfigurationVariables = {
    configuration: UpdateCurveConfigurationBody;
    cardId: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default function useUpdateCardTimeCurveMutation(callback: Function) {
    const { mutate: updateCardTimeCurve } = useMutation({
        mutationKey: ['update-card-time-curve'],
        mutationFn: (variables: UpdateCardTimeCurveConfigurationVariables) =>
            CardsApi.updateCardTimeCurve(variables.cardId, variables.configuration),
        onSuccess: (data, variables, context) => {
            callback(data, variables, context);
        },
        onError: () => toast({
            variant: "destructive",
            title: "Something happens!",
            description: "Can't update card interval"
        })
    });

    return { updateCardTimeCurve };
}