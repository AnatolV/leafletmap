// src/lib/components/LocationList/LocationList.types.ts
import React from "react";
import type {IAddresses, TLocale} from "../LeafletMap/LeafletMap.types.ts";

export type TLocationListStateProps = {
    locations: IAddresses;
    locale: TLocale;
    itemClickHandler: (key: string) => void;
    itemsRefs: React.RefObject<object>
};
export type TLocationListDispatchProps = object;
export type TLocationListProps = TLocationListStateProps & TLocationListDispatchProps;
