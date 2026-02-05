import {useLocation, useNavigate, useParams} from "react-router-dom";
import '@/styles/layout-wrapper.styles.scss';
import {Input} from "@/components/ui/input.tsx";
import PageHeaderSection from "@/components/Dashboard/DashboardHeaderSection/PageHeaderSection.tsx";
import {Button} from "@/components/ui/button.tsx";
import CardsListContentSection from "@/components/Groups/GroupsListContentSection/CardsListContentSection.tsx";
import useAggregatedDecks from "@/api/decks/useAggregatedDecks.ts";
import Card from "@/components/Card/Card.tsx";
import DeckCardMenubar from "@/components/DeckCardMenubar/DeckCardMenubar.tsx";
import CreateNewDeckModal from "@/components/Modals/DeckModals/CreateNewDeckModal.tsx";
import {useState} from "react";
import {DeckWithAggregatedDataResponse} from "@/api/decks/decks.ts";
import useQuicksearch from "@/hooks/useQuicksearch.ts";
import PageHeaderSectionTitle
    from "@/components/Dashboard/DashboardHeaderSection/PageHeaderSectionTitle/PageHeaderSectionTitle.tsx";
import {useMediaQuery} from "react-responsive";
import {Modal} from "@/ModalBox/modalBox.ts";

export default function SelectedGroupPage() {
    const isMobile = useMediaQuery({query: "(max-width: 700px)"});
    const navigate = useNavigate();
    const location = useLocation();
    const {groupId} = useParams();
    const {aggregatedDecks, refetch} = useAggregatedDecks(groupId!);
    const [searchInput, setSearchInput] = useState('');
    const filteredDecks = useQuicksearch<DeckWithAggregatedDataResponse>(aggregatedDecks!, ['deckName'], searchInput);


    // TODO: Make context for header || HARDCODED
    const ContentSectionHeader = isMobile ? MobileSearchbar
        : SelectedGroupDesktopContentHeader;

    return (
        <div className="layout-wrapper">
            <PageHeaderSection>
                {!isMobile && <div className="groups-header-section">
                    <Input
                        placeholder="Search"
                        className="groups-header-input"
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target?.value)
                        }}
                    />
                    {
                        // #TODO: Insert sorting combobox
                    }
                </div> || <PageHeaderSectionTitle>{location.state?.groupName}</PageHeaderSectionTitle>}
            </PageHeaderSection>

            <CardsListContentSection searchInput={searchInput} setSearchInput={setSearchInput}
                                     Header={ContentSectionHeader}>
                {
                    // TODO: Add template (design), if user haven't any decks here
                    filteredDecks?.map((deck) => (
                        <Card
                            key={groupId}
                            cardTitle={deck.name}
                            notificationMessage={deck?.dueCardsInDeck}
                            secondaryTile={<div>{`${deck.cardsInDeckTotal} cards`}</div>}
                            onClickHandler={() => {
                                Modal.open((modal) => <DeckCardMenubar modal={modal} groupId={groupId!}
                                                                       deckProperties={deck} refetchDecks={refetch}
                                                                       navigate={navigate}/>, '', 'deck-menubar'
                                )
                            }}
                        />
                    ))
                }
            </CardsListContentSection>
        </div>
    );


}


// TODO: DUPLICATED IN `GroupsList.tsx`. Move in separate component
function MobileSearchbar({searchInput, setSearchInput}: any) {
    return <Input
        placeholder="Search"
        className="groups-header-input"
        value={searchInput}
        onChange={(e) => {
            setSearchInput(e.target?.value)
        }}
    />
}

// TODO: ALSO MOVE TO SEPARATE COMPONENT
function SelectedGroupDesktopContentHeader() {
    const location = useLocation();
    const {groupId} = useParams();

    return <>
        <h1>{location.state?.groupName}</h1>
        <Button style={{padding: "25px 30px"}} onClick={() => onCreateNewDeckModal(groupId!)}>+ Create a
            new deck</Button>
    </>

    // TODO: TO AVOID REDUNDANT REFETECH - MOVE THEM TO `onClose` CALLBACK
    function onCreateNewDeckModal(groupId: string) {
        return Modal.open((modal) =>
            <CreateNewDeckModal modal={modal} groupId={groupId}/>, 'Create a new deck')
    }
}