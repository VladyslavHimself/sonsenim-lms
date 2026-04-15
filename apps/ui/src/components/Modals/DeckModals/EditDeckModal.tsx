import {Form} from "@/components/ui/form.tsx";
import {z} from "zod";
import {deckConfigurationFieldsSchema} from "@/components/Modals/DeckModals/deckConfigurationFields.schema.ts";
import {Separator} from "@radix-ui/react-separator";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {DeckModes} from "@/api/decks/decks.ts";
import {useMemo} from "react";
import useUpdateDeckMutation, {EditDeckMutationVariables} from "@/api/decks/useUpdateDeckMutation.ts";
import useDeleteDeckMutation from "@/api/decks/useDeleteDeckMutation.ts";
import {Trash2Icon} from "lucide-react";
import ModalFormFieldInput from "@/components/Modals/ui/ModalFormFieldInput/ModalFormFieldInput.tsx";
import {ModesToggleGroup} from "@/components/Modals/ui/ModesToggleGroup/ModesToggleGroup.tsx";
import {ModalInstance} from "@/ModalBox/modalBox.ts";
import {ModalBoxBody, ModalBoxConfirmationFooter} from "@/ModalBox/ModalBoxTemplates.tsx";
import {DecksStatsResponse} from "@sonsenim/contracts";
type Props = {
    deckProperties: DecksStatsResponse,
    refetchDecks: () => void,
    modal: ModalInstance
}

type deckConfigurationFieldsSchemaTypes = z.infer<typeof deckConfigurationFieldsSchema>;

export default function EditDeckModal({ deckProperties, refetchDecks, modal }: Props) {
    const { deleteDeck, asyncStatus: deleteDeckAsyncStatus } = useDeleteDeckMutation(onMakeModalAction);
    const { updateDeck, asyncStatus: updateDeckAsyncStatus } = useUpdateDeckMutation(onMakeModalAction);


    const form = useForm<deckConfigurationFieldsSchemaTypes>({
        resolver: zodResolver(deckConfigurationFieldsSchema),
        defaultValues: {
            name: deckProperties.name,
            isModeNormal: deckProperties.isModeNormal,
            isModeReversed: deckProperties.isModeReversed,
            isModeTyping: deckProperties.isModeTyping
        }
    });

    const defaultToggleValues = useMemo(() => {
        const defValues = [];

        for (const key in deckProperties) {
            if (deckProperties[key as keyof DeckModes]) {
                defValues.push(key);
            }
        }
        return defValues;
    }, [deckProperties]);

    return (
        <>
            <ModalBoxBody>
                <Form {...form}>
                    <form id="edit-deck-form"
                          onSubmit={form.handleSubmit((values: z.infer<typeof deckConfigurationFieldsSchema>) => {
                              updateDeck({
                                  deckId: deckProperties.id,
                                  deckConfiguration: Object.assign(values, {isRandomizedOrder: true})
                              } as EditDeckMutationVariables);
                          })}
                    >
                        <ModalFormFieldInput
                            name="name" form={form.control}
                            label="Deck Name" isRequired
                            placeholder="Animals and fruits"
                        />
                        <Separator className="my-6 h-1 bg-[#F0F0F0]"/>
                        <ModesToggleGroup defaultValues={defaultToggleValues} form={form} />
                    </form>
                </Form>
            </ModalBoxBody>

            <ModalBoxConfirmationFooter
                closeButtonProperties={{
                    label: <Trash2Icon />,
                    action: () => deleteDeck(deckProperties.id),
                    async: true,
                    asyncStatus: deleteDeckAsyncStatus
                }}
                submitButtonProperties={{
                    label: 'Edit',
                    formId: 'edit-deck-form',
                    restProps: {disabled: form.getValues().name === deckProperties.name},
                    async: true,
                    asyncStatus: updateDeckAsyncStatus
                }}
            />
        </>
    );

    function onMakeModalAction() {
        refetchDecks();
        modal.close(modal.id);
    }
};