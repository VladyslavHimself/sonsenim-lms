import './ContentCard.scss';


type Props = {
    title: string;
    information?: string;
}

export default function ContentCard({ title, information }: Props) {
    return (
        <div className="content-card">
            <span className="content-card-information">{information}</span>
            <span className="content-card-title">{title}</span>
        </div>
    );
};