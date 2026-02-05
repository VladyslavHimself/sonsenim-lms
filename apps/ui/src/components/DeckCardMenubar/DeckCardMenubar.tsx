import './DeckMenubar.scss';
import {Button} from "@/components/ui/button.tsx";
import {Brain, Download, Edit, List, PlusIcon, Upload} from "lucide-react";
import EditDeckModal from "@/components/Modals/DeckModals/EditDeckModal.tsx";
import AddNewCardModal from "@/components/Modals/CardModals/AddNewCardModal.tsx";
import {NavigateFunction} from "react-router-dom";
import {Modal, ModalInstance} from "@/ModalBox/modalBox.ts";

type Props = {
    modal: ModalInstance,
    groupId: string,
    groupName?: string,
    deckProperties: any,
    refetchDecks: () => void,
    navigate: NavigateFunction,
}


export default function DeckCardMenubar({modal, deckProperties, refetchDecks, groupId, navigate}: Props) {
    const { dueCardsInDeck } = deckProperties;
    return (
        <div className="deck-menubar-container">
            <Button disabled={!dueCardsInDeck} variant="outline" className="menubar-list-item" onClick={openMemoizationPage}><Brain/> Start
                Learning</Button>
            <Button variant="outline" className="menubar-list-item" onClick={onAddNewCardHandle}><PlusIcon/> Add new
                card</Button>
            <Button variant="outline" className="menubar-list-item" onClick={openCardListPage}><List/>Card List</Button>
            <Button variant="outline" className="menubar-list-item" onClick={onEditDeckHandle}><Edit/>Edit deck</Button>
            <Button disabled variant="outline" className="menubar-list-item"><Upload/>Export cards</Button>
            <Button disabled variant="outline" className="menubar-list-item"><Download/>Import cards</Button>
        </div>
    );

    function onEditDeckHandle() {
        Modal.open((modal) => <EditDeckModal modal={modal} deckProperties={deckProperties}
                                             refetchDecks={refetchDecks}/>, 'Edit deck', 'edit-deck-modal')
        modal.close(modal.id);
    }

    function onAddNewCardHandle() {
        Modal.open((modal) => <AddNewCardModal modal={modal} deckId={deckProperties.id}
                                               refetchDecks={refetchDecks}/>, 'Add new card', 'add-new-card-modal')
        modal.close(modal.id);
    }

    function openCardListPage() {
        navigate(`/groups/${groupId}/card-list/${deckProperties.id}`);
        modal.close(modal.id);
    }

    function openMemoizationPage() {
        navigate(`/memoization/${deckProperties.id}`);
        modal.close(modal.id);
    }
}