import {z} from "zod";
import {Form} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {newCardConfigurationSchema} from "@/components/Modals/CardModals/newCardConfiguration.schema.ts";
import ModalFormFieldInput from "@/components/Modals/ui/ModalFormFieldInput/ModalFormFieldInput.tsx";
import {CardTableEntity} from "@/pages/CardListPage.tsx";
import useEditCardMutation from "@/api/cards/useEditCardMutation.ts";
import {ModalInstance} from "@/ModalBox/modalBox.ts";
import {ModalBoxBody, ModalBoxConfirmationFooter} from "@/ModalBox/ModalBoxTemplates.tsx";
import {CardConfigurationBody} from "@sonsenim/contracts";

type Props = {
    card: CardTableEntity,
    deckId: string,
    modal: ModalInstance,
    refetchCardsFn: () => void
}

export default function EditExistingCardModal({ card, deckId, refetchCardsFn, modal }: Props) {
    const { primaryWord, explanation, definition, cardId } = card;
    const { updateCardMutation } = useEditCardMutation(() => {
        refetchCardsFn();
        modal.close(modal.id);
    });
    const form = useForm<z.infer<typeof newCardConfigurationSchema>>({
        resolver: zodResolver(newCardConfigurationSchema),
        defaultValues: { primaryWord, definition, explanation }
    });

    return <>
        <ModalBoxBody>
            <Form {...form}>
                <form
                    id="edit-card-form"
                    onSubmit={form.handleSubmit((values: z.infer<typeof newCardConfigurationSchema>) =>
                        editCard(values as unknown as CardConfigurationBody))}
                >
                    <ModalFormFieldInput name="primaryWord" form={form.control} label="Word *" />
                    <ModalFormFieldInput style={{marginTop: 25}} name="definition" form={form.control} label="Definition *" />
                    <ModalFormFieldInput style={{marginTop: 25}} name="explanation" form={form.control} label="Description" />
                </form>
            </Form>
        </ModalBoxBody>
        <ModalBoxConfirmationFooter
            submitButtonProperties={{
                label: "Edit",
                formId: "edit-card-form",
            }}
        />
    </>

    function editCard(values: CardConfigurationBody) {
        updateCardMutation({
            deckId: deckId!,
            cardId: cardId as unknown as string,
            cardConfiguration: values
        });
    }
}