import { PropsWithChildren } from "react";
import './PageHeaderSectionTitle.scss';

export default function PageHeaderSectionTitle({ children }: PropsWithChildren) {
    return (
        <div className="page-header-section-title">
            { children }
        </div>
    );
};