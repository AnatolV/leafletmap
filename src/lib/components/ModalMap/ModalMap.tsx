// src/lib/components/ModalMap/ModalMap.tsx
import "./ModalMap.css"
import useModalMap from "./useModalMap.ts";
import type {TModalMapProps} from "./ModalMap.types.ts";
import LocationList from "../LocationList/LocationList.tsx";

const ModalMap  = (props:TModalMapProps) => {

    const{itemClickHandler,itemRefs} = useModalMap(props);
    const {locale,isLoading,locations} = props;
    return (
        <>
            <div className='map-modal__sidebar'>
                <p className='map-modal__title'>{locale === 'ru' ?'Список отделений'  :'Список відділень' }</p>
                <hr className='map-modal__divider'/>
                <ul className='map-modal__list scrolled'>
                    {isLoading && !locations &&(
                        <li className='map-modal__loading'> Loading...</li>
                    )}
                    {!isLoading && locations &&(
                        <LocationList
                            locations={locations}
                            locale={locale}
                            itemClickHandler={itemClickHandler}
                            itemsRefs={itemRefs}
                        />
                    )}
                    {!isLoading && !locations && (
                        <li className='map-modal__loading'> Loading error</li>
                    )}
                </ul>
            </div>
            <div id="innermap" className='map-modal__content'></div>
        </>
    );
}

export default ModalMap;
