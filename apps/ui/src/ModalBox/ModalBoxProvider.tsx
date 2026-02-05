import React from "react";
import {Modal, ModalContext, ModalInstance} from "@/ModalBox/modalBox.ts";
import {v4 as uuid} from 'uuid';
import {createPortal} from "react-dom";
import {isEmpty} from "lodash";
import {CircleX} from "lucide-react";

type Props = {
    children: React.ReactNode
}

export default function ModalBoxProvider({children}: Props) {
    const [modals, setModals] = React.useState<ModalInstance[]>([]);

    const open = React.useCallback(
        (renderFn: (modal: ModalInstance) => React.ReactNode, title: string, modalClassname?: string, onClose?: () => void) => {
            const id = uuid();

            const modalObj = {
                id,
                title,
                modalClassname,
                render: renderFn,
                onClose
            };

            setModals(prev => [...prev, modalObj]);

            return id;
        },
        []
    );

    const close = React.useCallback((id: string) => {
        setModals(prev => {
            const target = prev.find(modal => modal.id === id);
            if (target?.onClose) target.onClose();
            return prev.filter(modal => modal.id !== id);
        })

    }, []);

    React.useEffect(() => {
        Modal.open = open;
        Modal.close = close;
    }, [open, close]);

    return (
        <ModalContext.Provider value={{open, close}}>
            {children}
            {
                createPortal(
                    <div className="modal-root">
                        {!!modals.length && <div className="modal-backdrop" onClick={() => {
                            const newModals = [...modals];
                            newModals.pop();
                            setModals(newModals);
                        }}/>}
                        {/*TODO: Add classnames to modals*/}
                        {modals.map(m => {
                            const modalObj: ModalInstance = {
                                id: m.id,
                                close: () => close(m.id)
                            };


                            return (
                                <div className="modal-box" key={m.id}>
                                    <div className={`modal-box-container ${m.modalClassname || ''}`}>
                                        {!isEmpty(m.title) && (
                                            <div className="modal-box-header">
                                                {m.title}
                                                <CircleX onClick={() => close(m.id)}
                                                         style={{cursor: 'pointer', stroke: '#F18C29'}}/>
                                            </div>
                                        )}
                                        {m.render(modalObj)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>,
                    document.body
                )
            }
        </ModalContext.Provider>
    )
}