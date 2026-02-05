//@ts-nocheck

import React, {useEffect, useState} from "react";
import ModalBoxes from "@/ModalBoxes/ModalBoxes.tsx";
import {isEmpty, isFunction} from "lodash";

import './ModalBoxes.scss';
import {CircleX} from "lucide-react";


/**
 * @deprecated Use `ModalBoxProvider` instead.
 */
export default function ModalBoxesContainer() {
    const [modalBoxes, setModalBoxes] = useState([]);

    useEffect(
        function () {
            if (!isEmpty(modalBoxes)) {
                document.body.classList.add('modal-boxes-opened');
                return;
            }
            document.body.classList.remove('modal-boxes-opened');
        },
        [modalBoxes]
    );

    useEffect(function () {
        ModalBoxes.addChangeListener(onChange);

        return function () {
            ModalBoxes.removeChangeListener(onChange);
        };
    }, []);

    return (
        <div className="modal-boxes">
            {modalBoxes.map(function ({ id, onCloseCallback, component, className, close, title }, index) {
                return (
                    <div className={`modal-box ${id}`} key={index}>
                        <div className="modal-box-overlay" onClick={close}></div>
                        <div className={`modal-box-container ${className}`}>
                            {!isEmpty(title) && (
                                <div className="modal-box-header">
                                    {title}
                                    <CircleX onClick={close} style={{cursor: 'pointer', stroke: '#F18C29'}} />
                                </div>
                            )}
                            {React.cloneElement(component, {
                                modalBox: {
                                    id,
                                    close(data) {
                                        isFunction(onCloseCallback) && onCloseCallback(data);
                                        close();
                                    }
                                }
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    function onChange(list) {
        setModalBoxes(list);
    }
}