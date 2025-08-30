import type {ICity, IMapLocation, IPoint, IRegion, LangType} from "../../lib/types.ts";
import React from "react";

interface ILocationList {
    locations: IMapLocation;
    lang: LangType;
    itemClickHandler: (key: string) => void;
    itemsRefs: React.RefObject<object>
}

type MarkerMap = {
    [key: string]: HTMLLIElement;
};
const LocationList = ({locations, lang, itemClickHandler, itemsRefs}: ILocationList) => {
    const tempItemRefs: MarkerMap = {};
    const renderItems = (items: IMapLocation, level: "region" | "city" | "point") => {
        if (!items) return null;
        return Object.keys(items).map(id => {
            const item = items[id];
            let name = '';
            let children= null;
            let className = '';
            if (level === 'region') {
                const region = item as IRegion;
                name = region.name[lang];
                className = 'region';
                children = region.cities as {[key: string]: ICity;};
            } else if (level === 'city') {
                const city = item as unknown as ICity;
                name = city.name[lang];
                className = 'city';
                children = city.points as {[key: string]: IPoint;} ;

            } else if (level === 'point') {
                const point = item as unknown as IPoint;
                name = `Пункт ${id} ${point.name[lang]}`;
                className = 'point';
            }

            const nestedClassName = `map-modal__list ${level}`;
            const nestedList = children ? (
                <ul className={nestedClassName}>
                    {renderItems(children, level === 'region' ? 'city' : 'point')}
                </ul>
            ) : null;
            return (
                <li
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        itemClickHandler(id);
                    }}
                    key={id}

                    ref={el => {
                        if (el) {
                            tempItemRefs[id] = el
                        }
                    }}
                    className={`map-modal__list-item ${className}`}>
                    {level !== 'point' && (
                        <div className="map-modal__list-block">
                            <span className="map-modal__list-item--name">{name}</span>
                            <span className="map-modal__list-block--opener"></span>
                        </div>
                    )}
                    {level === 'point' && (
                        <div className="map-modal__list-block">
                            <span className="map-modal__list-item--name">{name}</span>
                        </div>
                    )}
                    {nestedList}
                </li>
            );
        });
    };
    // об'єкт елементів для можливості розкриття списку
    itemsRefs.current = tempItemRefs;
    return <>{renderItems(locations as IMapLocation, 'region')}</>;
};

export default LocationList;
