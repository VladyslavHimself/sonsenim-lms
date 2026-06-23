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
import useCards from "@/api/cards/useCards.ts";
import {Card} from "@/api/cards/cards.ts";

type Props = {
    modal: ModalInstance
    deckId: string,
}

const COMMA = ',';
const TAB = '\t';
const SEMICOLON = ';';
const NEW_LINE = '\n';

const exportCardsConfiguration = z.object({
    cardInnerSeparator: z.string().min(1),
    cardOuterSeparator: z.string().min(1),
    objectToExport: z.string().min(1).optional()
});

export default function ExportCardsModal({deckId}: Props) {
    const {deckCards} = useCards(deckId);

    const form = useForm<z.infer<typeof exportCardsConfiguration>>({
        resolver: zodResolver(exportCardsConfiguration),
        defaultValues: {
            cardInnerSeparator: COMMA,
            cardOuterSeparator: SEMICOLON
        }
    });

    const [cardInnerCustomPattern, setCardInnerCustomPattern] = useState<string>();
    const [cardOuterCustomPattern, setCardOuterCustomPattern] = useState<string>();

    function formatCards(cards: Card[]) {
        const {cardInnerSeparator, cardOuterSeparator} = form.getValues();

        return cards.map(card => {
            const {primaryWord, definition, explanation} = card;
            if (explanation) {
                return [primaryWord, definition, explanation].join(cardInnerSeparator);
            }
            return [primaryWord, definition].join(cardInnerSeparator);
        }).join(cardOuterSeparator);
    }

    return (
        <>
            <ModalBoxBody>
                <Form {...form}>
                    <form id="export-cards-form" className="import-cards-modal"
                          onSubmit={form.handleSubmit(() => {
                              form.setValue('objectToExport', formatCards(deckCards));
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
                                value={form.getValues('objectToExport')}
                                id="importTextarea"
                                onChange={(e) => {
                                    form.setValue('objectToExport', e.target.value);
                                }}
                                placeholder="Exported data will be here"
                                style={{minHeight: '231px', maxHeight: '500px'}}
                            />
                        </Field>
                    </form>
                </Form>
            </ModalBoxBody>
            <ModalBoxConfirmationFooter
                submitButtonProperties={{
                    label: 'Export cards',
                    formId: 'export-cards-form',
                }}
            />
        </>
    );
};
