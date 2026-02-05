import './GroupsContentSection.scss';
import {ReactNode} from "react";



type Props = {
    children: ReactNode;
    Header: any;
    searchInput?: any;
    setSearchInput?: any;
}

// TODO: Header component with/without additional button
export default function CardsListContentSection({ setSearchInput, searchInput, children, Header }: Props) {
    return (
        <div className="cardsList-content-section">
            <div className="cardsList-content-section-header">
                <Header searchInput={searchInput} setSearchInput={setSearchInput} />
            </div>

            <div className="cardList-content-section-cards">
                { children }
            </div>
        </div>
    );


};