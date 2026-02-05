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
                form.setValue('isModeNormal', !!values.find((value) => value === 'isModeNormal'));
                form.setValue('isModeReversed', !!values.find((value) => value === 'isModeReversed'));
                form.setValue('isModeTyping', !!values.find((value) => value === 'isModeTyping'));
            }} type="multiple" variant="outline">
                <ToggleGroupItem className="modes-toggle-group-item" value="isModeNormal"
                                 aria-label="Toggle normal mode">
                    Normal
                </ToggleGroupItem>
                <ToggleGroupItem className="modes-toggle-group-item" value="isModeReversed"
                                 aria-label="Toggle reversed mode">
                    Reversed
                </ToggleGroupItem>
                <ToggleGroupItem className="modes-toggle-group-item" value="isModeTyping"
                                 aria-label="Toggle typing mode">
                    Typing
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}