import {useMemo} from "react";


export default function useQuicksearch<T>(
    unfilteredList: T[],
    filterKeys: Array< { [K in keyof T]: T[K] extends string ? K : never; }[keyof T]>,
    value: string
) {
    return useMemo(() => {
        if (value && unfilteredList) {
            return unfilteredList.filter((item) =>
                filterKeys.some((key) =>
                    (item[key] as string).toLowerCase().includes(value.toLowerCase())
                )
            );
        }
        return unfilteredList;
    }, [filterKeys, unfilteredList, value]);
}