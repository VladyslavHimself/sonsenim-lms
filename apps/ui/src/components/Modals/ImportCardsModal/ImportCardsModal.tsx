import {Form} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {deckConfigurationFieldsSchema} from "@/components/Modals/DeckModals/deckConfigurationFields.schema.ts";
import {Separator} from "@radix-ui/react-separator";
import ModalFormFieldInput from "@/components/Modals/ui/ModalFormFieldInput/ModalFormFieldInput.tsx";
import {ModesToggleGroup} from "@/components/Modals/ui/ModesToggleGroup/ModesToggleGroup.tsx";
import {ModalInstance} from "@/ModalBox/modalBox.ts";
import {ModalBoxBody, ModalBoxConfirmationFooter} from "@/ModalBox/ModalBoxTemplates.tsx";

type Props = {
    modal: ModalInstance
    deckId: string,
}

export default function ImportCardsModal({deckId, modal}: Props) {
    // modal.close(modal.id);

    const form = useForm<z.infer<typeof deckConfigurationFieldsSchema>>({
        resolver: zodResolver(deckConfigurationFieldsSchema)
    });

    return (
        <>
            <ModalBoxBody>
                <Form {...form}>
                    <form id="import-cards-form"
                          onSubmit={form.handleSubmit((values: z.infer<typeof deckConfigurationFieldsSchema>) => {
                          })}
                    >
                        <ModalFormFieldInput
                            name="name" form={form.control}
                            label="Deck Name" isRequired
                            placeholder="Animals and fruits"
                        />
                        <Separator className="my-6 h-1 bg-[#F0F0F0]"/>
                        <ModesToggleGroup defaultValues={['isModeNormal']} form={form}/>
                    </form>
                </Form>
            </ModalBoxBody>
            <ModalBoxConfirmationFooter
                submitButtonProperties={{
                    label: 'Import',
                    formId: 'import-cards-form',
                    // asyncStatus: asyncStatus,
                    // async: true
                }}
            />
        </>
    );
};