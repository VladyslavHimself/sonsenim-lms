import {fireEvent, render, screen} from "@testing-library/react";
import Card from "@/components/Card/Card.tsx";
import {MouseEventHandler} from "react";

describe('Card', () => {
    let onEditHandlerMock: ReturnType<typeof vi.fn>;
    let onClickHandlerMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onEditHandlerMock = vi.fn();
        onClickHandlerMock = vi.fn();

        render(
            <Card
                cardTitle="Editable Card"
                secondaryTile="Subtitle"
                onClickHandler={onClickHandlerMock as MouseEventHandler<HTMLDivElement>}
                onEditHandler={onEditHandlerMock as MouseEventHandler<SVGSVGElement>}
                />
        )
    })

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('Should call click handler when card is clicked ', () => {
        const card = screen.getByText("Editable Card").closest(".group-card");
        fireEvent.click(card!);

        expect(onClickHandlerMock).toHaveBeenCalled();
    });

    it('Should show edit icon while hovered', () => {
        let pencil = screen.queryByTestId("card-edit-pencil-icon");
        expect(pencil).toBeNull();

        const card = screen.getByText("Editable Card").closest('.group-card')!;
        fireEvent.mouseOver(card);

        pencil = screen.getByTestId("card-edit-pencil-icon");
        expect(pencil).toBeTruthy();
    });


    it('Should hide edit icon when hovered out', () => {
        const card = screen.getByText('Editable Card').closest('.group-card')!;
        fireEvent.mouseOver(card);

        let pencil = screen.getByTestId("card-edit-pencil-icon");
        expect(pencil).toBeTruthy();

        fireEvent.mouseLeave(card);
        pencil = screen.queryByTestId("card-edit-pencil-icon")!;
        expect(pencil).toBeNull();
    });

    it('Should call onEditHandler when edit icon is clicked', () => {
        const card = screen.getByText('Editable Card').closest('.group-card')!;
        fireEvent.mouseOver(card);

        const pencil = screen.getByTestId('card-edit-pencil-icon');
        fireEvent.click(pencil!);

        expect(onEditHandlerMock).toHaveBeenCalled();
    });

    // TODO: Add branches test cases for notification message, onEditHandler existence flow.
});