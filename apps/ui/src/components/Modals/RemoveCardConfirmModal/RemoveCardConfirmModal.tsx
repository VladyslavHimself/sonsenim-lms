import './RemoveCardConfirmModal.scss';
import useRemoveCardMutation from "@/api/cards/useRemoveCardMutation.ts";
import {ModalBoxBody, ModalBoxConfirmFooter} from "@/ModalBox/ModalBoxTemplates.tsx";
import {ModalInstance} from "@/ModalBox/modalBox.ts";

type Props = {
    deckId: string;
    cardId: string;
    modal: ModalInstance;
}

export default function RemoveCardConfirmModal({ deckId, cardId, modal }: Props) {
    const { removeCard } = useRemoveCardMutation(() => {
        modal.close(modal.id);
    })

    return (
        <ModalBoxBody>
            <p>
                Are you sure, that you want to delete this card?<br />
                All your progress will be lose
            </p>
            <ModalBoxConfirmFooter
                confirmButtonProperties={{
                    label: "Delete",
                    action: () => removeCard({ deckId, cardId }),
                    className: 'remove-card-confirm-modal-button',
            }}/>
        </ModalBoxBody>
    );
};