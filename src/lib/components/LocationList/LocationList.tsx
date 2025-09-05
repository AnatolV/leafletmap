import './LocationList.css';
import type {TLocationListProps} from './LocationList.types.ts';
import type {IAddresses} from "../LeafletMap/LeafletMap.types.ts";


const LocationList = (props: TLocationListProps) => {
   const {locations, locale, itemClickHandler, itemsRefs} = props;
    const tempItemRefs: { [key: string]: HTMLLIElement } = {};
    const renderItems = (items: IAddresses,level=0) => {
        if (!items) return null;
        level += 1;
        return Object.keys(items).map(id => {
            const className = `level_${level}`;
            const item = items[id];
            let name: string = item.name[locale]? item.name[locale]:item.name.uk;
            const children = item.list ;
            if (!children) {
                name = `Пункт ${id} ${item.name[locale]}`;
            }

            const nestedClassName = `map-modal__list list_${level}`;

            const nestedList = children ? (
                <ul className={nestedClassName}>
                    {renderItems(children,level)}
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
                    {children && (
                        <div className='map-modal__list-block'>
                            <span className='map-modal__list-item--name'>{name}</span>
                            <span className='map-modal__list-block--opener'></span>
                        </div>
                    )}
                    {!children && (
                        <div className='map-modal__list-block'>
                            <span className='map-modal__list-item--name'>{name}</span>
                        </div>
                    )}
                    {nestedList}
                </li>
            );
        });
    };
    // об'єкт елементів для можливості розкриття списку
    itemsRefs.current = tempItemRefs;
    return <>{renderItems(locations)}</>;
};

export default LocationList;

