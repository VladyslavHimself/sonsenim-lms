import './Card.scss';
import GroupImageExample from "@/assets/Icons/Groups/group-image-example.png";

import {Pencil} from "lucide-react";
import {MouseEventHandler, ReactNode, useState} from "react";

type Props = {
    cardTitle: string,
    secondaryTile: ReactNode | string,
    onClickHandler: MouseEventHandler<HTMLDivElement>,
    onEditHandler?: MouseEventHandler<SVGSVGElement>,
    imageSrc?: string
    notificationMessage?: number;
}


// TODO: Move refetch
export default function Card({
                                 cardTitle,
                                 notificationMessage,
                                 secondaryTile,
                                 onClickHandler,
                                 onEditHandler,
                                 imageSrc
                             }: Props) {
    // TODO: Make it with ref
    const [isEditVisible, setIsEditVisible] = useState<boolean>(false);
    return (

        // TODO: Rename classes
        <div className="group-card"
             onMouseEnter={() => setIsEditVisible(true)}
             onMouseLeave={() => {
                 setIsEditVisible(false)
             }}
             onClick={onClickHandler}
             {...(notificationMessage !== undefined && {
                 'data-notification-message': notificationMessage
             })}
        >
            <div className="group-card-info">
                <div className="group-card-info-title">
                    <div>{cardTitle}</div>
                    {onEditHandler && isEditVisible && <Pencil
                        data-testid="card-edit-pencil-icon"
                        width={20}
                        height={20}
                        onClick={(e) => onEditHandler(e)}/>
                    }
                </div>
                {secondaryTile}
            </div>
            {imageSrc && (
                <div className="group-card-image">
                    <img src={GroupImageExample} alt=""/>
                </div>
            )}
        </div>
    );
};