import React, {useContext} from "react";

export type ModalInstance = {
    id: string;
    element: React.ReactNode;
    title?: string;
    modalClassname?: string;
    close: (id: string) => void;
    onClose?: () => void;
}

export type ModalAPI = {
    open: (element: React.ReactNode, onClose?: () => void) => string;
    close: (id: string) => void;
}

export const ModalContext = React.createContext<ModalAPI | null>(null);

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error('useModal must be used within a ModalProvider');
    return ctx;
}

export const Modal = {
    // See reference in ModalBoxProvider
    open: (fn: (modal: ModalInstance) => React.ReactNode, title?: string, modalClassname?: string, onClose?: () => void): string => {
        throw new Error("ModalBoxProvider is not mounted");
    },
    close: (id: string) => {
    }
};