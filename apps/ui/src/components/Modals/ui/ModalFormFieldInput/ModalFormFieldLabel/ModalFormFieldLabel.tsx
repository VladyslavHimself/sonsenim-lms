import {FormLabel} from "@/components/ui/form.tsx";
import './ModalFormFieldLabel.scss';

type Props = {
    label: string;
    isRequired?: boolean;
};
export const ModalFormFieldLabel = ({label, isRequired}: Props) => {
    return (
        <FormLabel className="modal-form-field-input-label">
            {label}
            {isRequired && <span style={{color: '#F18C29', fontSize: 20}}> *</span>}
        </FormLabel>
    );
};