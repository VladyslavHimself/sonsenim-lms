import {Form, FormField, FormItem} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Separator} from "@radix-ui/react-separator";
import {ModalInstance} from "@/ModalBox/modalBox.ts";
import {ModalBoxBody, ModalBoxConfirmationFooter} from "@/ModalBox/ModalBoxTemplates.tsx";
import {Textarea} from "@/components/ui/textarea";
import {Field} from "@/components/ui/field";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {importCardsConfiguration} from "./importCardsConfiguration.schema";
import {
    ModalFormFieldLabel
} from "@/components/Modals/ui/ModalFormFieldInput/ModalFormFieldLabel/ModalFormFieldLabel.tsx";
import {useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {useQueryClient} from "@tanstack/react-query";
import useImportNewCardsMutation from "@/api/cards/useImportNewCardsMutation.ts";
import {ImportCardsConfigurationBody} from "@sonsenim/contracts";

type Props = {
    modal: ModalInstance
    deckId: string,
}

const COMMA = ',';
const TAB = '\t';
const SEMICOLON = ';';
const NEW_LINE = '\n';

export default function ImportCardsModal({deckId, modal}: Props) {
    const queryClient = useQueryClient();

    const {importNewCards, asyncStatus: importCardsAsyncStatus} = useImportNewCardsMutation(() => {
        queryClient.invalidateQueries({queryKey: ['aggregated-decks']}).then(r => r);
        modal.close(modal.id);
    });

    const form = useForm<z.infer<typeof importCardsConfiguration>>({
        resolver: zodResolver(importCardsConfiguration),
        defaultValues: {
            cardInnerSeparator: COMMA,
            cardOuterSeparator: SEMICOLON
        }
    });

    const [cardInnerCustomPattern, setCardInnerCustomPattern] = useState<string>();
    const [cardOuterCustomPattern, setCardOuterCustomPattern] = useState<string>();


    // TODO: Double Check for edge-cases
    function parseImportCards(raw: z.infer<typeof importCardsConfiguration>) {
        const {cardInnerSeparator, cardOuterSeparator} = raw;
        const cardInnerPattern = cardInnerSeparator === TAB ? /\t/g : cardInnerSeparator;
        const cardOuterPattern = cardOuterSeparator === NEW_LINE ? /\n/g : cardOuterSeparator;

        const cards = raw.objectToImport.split(cardOuterPattern);
        const parsedCards = cards.map(card => {
            return card.split(cardInnerPattern);
        });

        return parsedCards.map(card => ({
                primaryWord: card[0],
                definition: card[1],
                explanation: card[2] ? card[2] : "",
            }))
    }

    return (
        <>
            <ModalBoxBody>
                <Form {...form}>
                    <form id="import-cards-form" className="import-cards-modal"
                          onSubmit={form.handleSubmit((values: z.infer<typeof importCardsConfiguration>) => {
                              const parsedCards: ImportCardsConfigurationBody = parseImportCards(values);
                              importNewCards({ deckId, parsedCards });
                          })}
                    >
                        <FormField form={form.control} defaultValue="comma-separator" name="cardInnerSeparator"
                                   render={({field}) => (
                                       <FormItem>
                                           <ModalFormFieldLabel label={"Front, back, additional separators:"}/>
                                           <RadioGroup style={{marginTop: '15px'}} {...field} name="cardInnerSeparator"
                                                       className="w-fit flex gap-5"
                                                       onValueChange={(values) => {
                                                           form.setValue("cardInnerSeparator", values);
                                                       }}>
                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value={COMMA} id="radio-item-comma"/>
                                                   <label className="import-cards-modal-field-label"
                                                          htmlFor="radio-item-comma">Comma</label>
                                               </div>

                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value={TAB} id="radio-item-tab"/>
                                                   <label className="import-cards-modal-field-label"
                                                          htmlFor="radio-item-tab">Tab</label>
                                               </div>
                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value={cardInnerCustomPattern}
                                                                   id="radio-item-custom-inner-pattern"/>
                                                   <label className="import-cards-modal-field-label"
                                                          htmlFor="radio-item-custom-inner-pattern">
                                                       <Input value={cardInnerCustomPattern}
                                                              onChange={e => setCardInnerCustomPattern(e.target.value)}
                                                       />
                                                   </label>
                                               </div>
                                           </RadioGroup>
                                       </FormItem>
                                   )}/>

                        <FormField form={form.control} defaultValue="semicolon-separator" name="cardOuterSeparator"
                                   render={({field}) => (
                                       <FormItem style={{marginTop: '25px'}}>
                                           <ModalFormFieldLabel label={"Front, back, additional separators:"}/>
                                           <RadioGroup style={{marginTop: '15px'}} {...field}
                                                       onValueChange={(values) => {
                                                           form.setValue("cardOuterSeparator", values);
                                                       }} className="w-fit flex gap-5">
                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value={SEMICOLON}
                                                                   id="radio-item-semicolon"/>
                                                   <label className="import-cards-modal-field-label"
                                                          htmlFor="radio-item-semicolon">Semicolon</label>
                                               </div>

                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value={NEW_LINE} id="radio-item-new-line"/>
                                                   <label className="import-cards-modal-field-label"
                                                          htmlFor="radio-item-new-line">New Line</label>
                                               </div>

                                               <div className="flex items-center gap-3">
                                                   <RadioGroupItem value={cardOuterCustomPattern}
                                                                   id="radio-item-custom-outer-pattern"/>
                                                   <label className="import-cards-modal-field-label"
                                                          htmlFor="radio-item-custom-outer-pattern">
                                                       <Input value={cardOuterCustomPattern}
                                                              onChange={e => setCardOuterCustomPattern(e.target.value)}
                                                       />
                                                   </label>
                                               </div>

                                           </RadioGroup>
                                       </FormItem>
                                   )}/>

                        <Separator className="my-6 h-1 bg-[#F0F0F0]"/>
                        <Field>
                            <ModalFormFieldLabel label="Paste data into the form" isRequired/>
                            <Textarea
                                id="importTextarea"
                                onChange={(e) => {
                                    form.setValue('objectToImport', e.target.value);
                                }}
                                placeholder="front1, back1, additional1;"
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
                    asyncStatus: importCardsAsyncStatus,
                    async: true,
                }}
            />
        </>
    );
};
