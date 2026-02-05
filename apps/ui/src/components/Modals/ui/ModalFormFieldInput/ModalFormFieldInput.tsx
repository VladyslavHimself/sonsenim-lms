import {FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import './ModalFormFieldInput.scss';

// TODO: add types to form property
type Props = {
    name: string;
    form: any;
    label: string;
    isRequired?: boolean;
    style?: any;
    [x: string]: any;
}

export default function ModalFormFieldInput({ name, form, label, style, isRequired, ...rest }: Props) {
    return (
        <FormField name={name} control={form.control} render={({field}) => (
            <FormItem style={style && {...style}}>
                <FormLabel className="modal-form-field-input-label">
                    {label}
                    {isRequired && <span style={{color: '#F18C29', fontSize: 20}}> *</span>}
                </FormLabel>
                <FormControl>
                    <Input className="modal-form-field-input" {...rest} {...field} />
                </FormControl>
            </FormItem>
        )}/>
    );
};