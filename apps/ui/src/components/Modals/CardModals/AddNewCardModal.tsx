import {z} from "zod";
import {Form} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {newCardConfigurationSchema} from "@/components/Modals/CardModals/newCardConfiguration.schema.ts";
import useAddNewCardMutation from "@/api/cards/useAddNewCardMutation.ts";
import ModalFormFieldInput from "@/components/Modals/ui/ModalFormFieldInput/ModalFormFieldInput.tsx";
import {ModalInstance} from "@/ModalBox/modalBox.ts";
import {ModalBoxBody, ModalBoxConfirmationFooter} from "@/ModalBox/ModalBoxTemplates.tsx";
import {CardConfigurationBody} from "@sonsenim/contracts";

type Props = {
    deckId: number,
    modal: ModalInstance,
    refetchDecks: () => void
}

export default function AddNewCardModal({deckId, refetchDecks}: Props) {
    const {addNewCard} = useAddNewCardMutation(() => {
        refetchDecks();
        form.setValue('primaryWord', '')
        form.setValue('definition', '')
        form.setValue('explanation', '')
    });
    const form = useForm<z.infer<typeof newCardConfigurationSchema>>({
        resolver: zodResolver(newCardConfigurationSchema)
    });

    return <>
        <ModalBoxBody>
            <Form {...form}>
                <form
                    id="add-new-card-form"
                    onSubmit={form.handleSubmit((values: z.infer<typeof newCardConfigurationSchema>) => {
                        createNewCard(values as unknown as CardConfigurationBody);
                        form.setFocus("primaryWord")
                    })}
                >
                    <ModalFormFieldInput name="primaryWord" form={form.control} label="Word *"/>
                    <ModalFormFieldInput style={{marginTop: 25}} name="definition" form={form.control}
                                         label="Definition *"/>
                    <ModalFormFieldInput style={{marginTop: 25}} name="explanation" form={form.control}
                                         label="Description"/>
                </form>
            </Form>
        </ModalBoxBody>
        <ModalBoxConfirmationFooter
            submitButtonProperties={{
                label: "Add new card",
                formId: "add-new-card-form",
            }}
        />
    </>

    function createNewCard(values: CardConfigurationBody) {
        addNewCard({
            deckId: deckId,
            cardConfiguration: values
        });
    }
}