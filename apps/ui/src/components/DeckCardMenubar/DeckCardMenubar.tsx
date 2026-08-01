import './DeckMenubar.scss';
import { Button } from "@/components/ui/button.tsx";
import { Brain, Download, Edit, List, PlusIcon, Upload } from "lucide-react";
import EditDeckModal from "@/components/Modals/DeckModals/EditDeckModal.tsx";
import AddNewCardModal from "@/components/Modals/CardModals/AddNewCardModal.tsx";
import { NavigateFunction } from "react-router-dom";
import { Modal, ModalInstance } from "@/ModalBox/modalBox.ts";
import ImportCardsModal from "@/components/Modals/ImportExportCardsModal/ImportCardsModal.tsx";
import ExportCardsModal from "@/components/Modals/ImportExportCardsModal/ExportCardsModal.tsx";

type Props = {
  modal: ModalInstance,
  groupId: string,
  groupName?: string,
  deckProperties: any,
  refetchDecks: () => void,
  navigate: NavigateFunction,
}


export default function DeckCardMenubar({ modal, deckProperties, refetchDecks, groupId, navigate }: Props) {
  const { dueCardsInDeck, cardsInDeckTotal } = deckProperties;
  const isPracticeFallback = !+dueCardsInDeck && !!+cardsInDeckTotal;

  return (
    <div className="deck-menubar-container">
      <Button disabled={!+cardsInDeckTotal} variant="outline" className="menubar-list-item"
        onClick={openMemoizationPage}><Brain /> {isPracticeFallback ? 'Practice' : 'Start Learning'}</Button>
      <Button variant="outline" className="menubar-list-item" onClick={onAddNewCardHandle}><PlusIcon /> Add new
        card</Button>
      <Button variant="outline" className="menubar-list-item" onClick={openCardListPage}><List />Card List</Button>
      <Button variant="outline" className="menubar-list-item" onClick={onEditDeckHandle}><Edit />Edit deck</Button>
      <Button variant="outline" className="menubar-list-item" onClick={onExportCardsHandle}><Upload />Export cards</Button>
      <Button variant="outline" className="menubar-list-item" onClick={onImportCardsHandle}><Download />Import
        cards</Button>
    </div>
  );

  function onEditDeckHandle() {
    Modal.open((modal) => <EditDeckModal modal={modal} deckProperties={deckProperties}
      refetchDecks={refetchDecks} />, 'Edit deck', 'edit-deck-modal')
    modal.close(modal.id);
  }

  function onAddNewCardHandle() {
    Modal.open((modal) => <AddNewCardModal modal={modal} deckId={deckProperties.id}
      refetchDecks={refetchDecks} />, 'Add new card', 'add-new-card-modal')
    modal.close(modal.id);
  }

  function openCardListPage() {
    navigate(`/groups/${groupId}/card-list/${deckProperties.id}`);
    modal.close(modal.id);
  }

  function openMemoizationPage() {
    const query = isPracticeFallback ? '?practice=true' : '';
    navigate(`/memoization/${deckProperties.id}${query}`);
    modal.close(modal.id);
  }

  function onImportCardsHandle() {
    Modal.open((modal) => <ImportCardsModal modal={modal} deckId={deckProperties.id} />,
      'Import cards to deck', 'import-cards-modal');
    modal.close(modal.id);
  }

  function onExportCardsHandle() {
    Modal.open((modal) => <ExportCardsModal modal={modal} deckId={deckProperties.id} />,
        'Export cards from deck', 'export-cards-modal');
    modal.close(modal.id);
  }
}
