import {Form, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Separator} from "@radix-ui/react-separator";
import {ModalInstance} from "@/ModalBox/modalBox.ts";
import {ModalBoxBody, ModalBoxConfirmationFooter} from "@/ModalBox/ModalBoxTemplates.tsx";
import {Textarea} from "@/components/ui/textarea";
import {Field, FieldLabel} from "@/components/ui/field";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {importCardsConfiguration} from "./importCardsConfiguration.schema";
import {
    ModalFormFieldLabel
} from "@/components/Modals/ui/ModalFormFieldInput/ModalFormFieldLabel/ModalFormFieldLabel.tsx";

type Props = {
    modal: ModalInstance
    deckId: string,
}

export default function ImportCardsModal({deckId, modal}: Props) {
    // modal.close(modal.id);

    const form = useForm<z.infer<typeof importCardsConfiguration>>({
        resolver: zodResolver(importCardsConfiguration),
        defaultValues: {
            cardInnerSeparator: "comma-separator",
            cardOuterSeparator: "semicolon-separator"
        }
    });

    return (
        <>
            <ModalBoxBody>
                <Form {...form}>
                    <form id="import-cards-form" className="import-cards-modal"
                          onSubmit={form.handleSubmit((values: z.infer<typeof importCardsConfiguration>) => {
                              console.log(values);
                          })}
                    >
                        <FormField form={form.control} defaultValue="comma-separator" name="cardInnerSeparator"
                                   render={({field}) => (
                                       <FormItem>
                                           <ModalFormFieldLabel label={"Front, back, additional separators:"}/>
                                           <RadioGroup style={{marginTop: '15px'}} {...field} name="cardInnerSeparator" className="w-fit flex gap-5"
                                                       onValueChange={(values) => {
                                                           form.setValue("cardInnerSeparator", values);
                                                       }}>
                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value="comma-separator" id="radio-item-comma"/>
                                                   <label className="import-cards-modal-field-label" htmlFor="radio-item-comma">Comma</label>
                                               </div>

                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value="tab-separator" id="radio-item-tab"/>
                                                   <label className="import-cards-modal-field-label" htmlFor="radio-item-tab">Tab</label>
                                               </div>
                                           </RadioGroup>
                                       </FormItem>
                                   )}/>

                        <FormField form={form.control} defaultValue="semicolon-separator" name="cardOuterSeparator"
                                   render={({field}) => (
                                       <FormItem style={{marginTop: '25px'}}>
                                           <ModalFormFieldLabel label={"Front, back, additional separators:"}/>
                                           <RadioGroup style={{marginTop: '15px'}} {...field} onValueChange={(values) => {
                                               form.setValue("cardOuterSeparator", values);
                                           }} className="w-fit flex gap-5">
                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value="semicolon-separator"
                                                                   id="radio-item-semicolon"/>
                                                   <label className="import-cards-modal-field-label" htmlFor="radio-item-semicolon">Semicolon</label>
                                               </div>

                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value="new-line-separator" id="radio-item-new-line"/>
                                                   <label className="import-cards-modal-field-label" htmlFor="radio-item-new-line">New Line</label>
                                               </div>

                                           </RadioGroup>
                                       </FormItem>
                                   )}/>

                        <Separator className="my-6 h-1 bg-[#F0F0F0]"/>
                        <Field>
                            <ModalFormFieldLabel label="Paste data into the form" isRequired />
                            <Textarea
                                id="importTextarea"
                                onChange={(e) => {
                                    form.setValue('objectToImport', e.target.value);
                                }}
                                placeholder="front1;back1; additional1 (optional);"
                                style={{minHeight: '231px', maxHeight: '500px'}}
                            />
                        </Field>
                    </form>
                </Form>
            </ModalBoxBody>
            <ModalBoxConfirmationFooter
                submitButtonProperties={{
                    label: 'Import cards',
                    formId: 'import-cards-form',
                }}
            />
        </>
    );
};
