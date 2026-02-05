import './ModesToggleGroup.scss';
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";



// TODO: Make form types
type Props = {
    defaultValues: string[],
    form: any
};

export function ModesToggleGroup({defaultValues, form}: Props) {
    return (
        <div className="modes-toggle-group">
            <span>Modes</span>
            <ToggleGroup defaultValue={defaultValues} onValueChange={(values) => {
                // TODO: Optimize later
                form.setValue('flashcardNormal', !!values.find((value) => value === 'flashcardNormal'));
                form.setValue('flashcardReversed', !!values.find((value) => value === 'flashcardReversed'));
                form.setValue('flashcardTyping', !!values.find((value) => value === 'flashcardTyping'));
            }} type="multiple" variant="outline">
                <ToggleGroupItem className="modes-toggle-group-item" value="flashcardNormal"
                                 aria-label="Toggle normal mode">
                    Normal
                </ToggleGroupItem>
                <ToggleGroupItem className="modes-toggle-group-item" value="flashcardReversed"
                                 aria-label="Toggle reversed mode">
                    Reversed
                </ToggleGroupItem>
                <ToggleGroupItem className="modes-toggle-group-item" value="flashcardTyping"
                                 aria-label="Toggle typing mode">
                    Typing
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}