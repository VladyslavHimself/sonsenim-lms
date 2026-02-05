import './CardListTableContent.scss';
import {CardTableEntity} from "@/pages/CardListPage.tsx";
import {DataTable} from "@/components/DataTable/DataTable.tsx";
import useCardListTableColumns from "@/components/CardListTableContent/useCardListTableColumns.tsx";
import {useMediaQuery} from "react-responsive";

type Props = {
    deckCards: CardTableEntity[],
    refetchCards: () => void,
}

export default function CardListTableContent({ deckCards, refetchCards }: Props) {
    const cardListColumns = useCardListTableColumns(refetchCards);
    const isMobile = useMediaQuery({query: "(max-width: 700px)"});

    if (!deckCards) return null;

    return (
        <div className={`card-list-table-content ${isMobile && "is-mobile"}`}>
            <DataTable columns={cardListColumns} data={deckCards} />
        </div>
    );
};