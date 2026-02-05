import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem, CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {useEffect, useRef, useState} from "react";

export type SelectionItem = {
    value: number,
    label: string,
}

type Props = {
    selectionList: SelectionItem[] | [],
    selectedValue: SelectionItem,
    onChangeValue: (groupId: SelectionItem) => void,
    placeholder: string,
    searchPlaceholder: string,
}

export function Combobox({selectionList, selectedValue, onChangeValue, placeholder, searchPlaceholder}: Props) {
    const [open, setOpen] = React.useState(false)

    const buttonRef = useRef(null);
    const [buttonWidth, setButtonWidth] = useState("auto");

    useEffect(() => {
        if (buttonRef.current) {
            // @ts-expect-error reference
            setButtonWidth(buttonRef.current.offsetWidth + "px");
        }
    }, [window.innerWidth]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={buttonRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[100%] h-[60px] justify-between bg-[#E8E8E8] hover:bg-[#ECECEC]"
                >
                    {selectedValue.value
                        ? selectionList.find((item) => item.value === selectedValue.value)?.label
                        : placeholder}
                    <CaretSortIcon color="orange" className="ml-2 h-8 w-8 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent style={{ width: buttonWidth }} className="p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-12" />
                    <CommandEmpty>No groups found.</CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {selectionList.map((item) => (
                                <CommandItem
                                    className="p-3"
                                    key={item.value}
                                    value={item.value as unknown as string}
                                    onSelect={() => {
                                        onChangeValue(item)
                                        setOpen(false)
                                    }}
                                >
                                    {item.label}
                                    <CheckIcon
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            selectedValue.value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
