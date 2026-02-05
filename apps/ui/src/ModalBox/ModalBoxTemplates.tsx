import {Button, ButtonProps} from "@/components/ui/button.tsx";
import React from "react";
import './modalBox.scss';

type ConfirmationFooterModalProps = {
    closeButtonProperties?: {
        label: string | React.ReactNode,
        action?: () => void,
        restProps?: ButtonProps & React.RefAttributes<HTMLButtonElement>
    },
    submitButtonProperties?: {
        label: string | React.ReactNode,
        formId: string,
        action?: () => void,
        restProps?: ButtonProps & React.RefAttributes<HTMLButtonElement>
    }
}

type FooterConfirmProps = {
    confirmButtonProperties: {
        label: string | Element,
        action: () => void,
        restProps?: ButtonProps & React.RefAttributes<HTMLButtonElement>
    }
}

export function ModalBoxFooter({ children }) {
    return <div className="modal-box-footer">{children}</div>;
}

export function ModalBoxBody({children}) {
    return <div className="modal-box-body">{children}</div>;
}

export function ModalBoxConfirmationFooter({closeButtonProperties, submitButtonProperties}: ConfirmationFooterModalProps) {
    return (
        <div className="modal-box-footer">
            {
                closeButtonProperties && <Button
                    onClick={closeButtonProperties.action}
                    className="modal-box-cancel-button"
                    {...closeButtonProperties.restProps}
                >{closeButtonProperties.label}</Button>
            }
            <Button
                form={submitButtonProperties?.formId}
                type="submit"
                className="modal-box-submit-button"
                {...submitButtonProperties?.restProps}
            >{submitButtonProperties?.label}</Button>
        </div>
    );
}

export function ModalBoxConfirmFooter({ confirmButtonProperties }: FooterConfirmProps) {
   return (
       <Button
           onClick={confirmButtonProperties.action}
           className={`modal-box-submit-button ${confirmButtonProperties.className}`}
           {...confirmButtonProperties.restProps}
       >{confirmButtonProperties.label}</Button>
   )
}