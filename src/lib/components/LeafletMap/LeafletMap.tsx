// src/lib/components/LeafletMap/LeafletMap.tsx
import  './LeafletMap.css'
import ModalMap from "../ModalMap/ModalMap.tsx";
import Button from "../Button/Button.tsx";
import type {TLeafletMapProps} from "./LeafletMap.types.ts";
import useLeafletMap from "./useLeafletMap.ts";


export function LeafletMap(props: TLeafletMapProps) {

    const {handleClose, handleOpen, locations,opened,isLoading} = useLeafletMap(props);
    const {locale,tileProvider} = props;


    return (
        <>
            {opened && (
                <>
                    <div className='map-overlay' onClick={handleClose}></div>
                    <div className='map-modal'>
                        <div className='map-modal__close' onClick={handleClose}>x</div>
                        <ModalMap tileProvider={tileProvider} locations={locations} handleClose={handleClose} locale={locale} isLoading={isLoading}/>
                    </div>
                </>
            )}
            {!opened &&(<Button locale={locale} handleOpen={handleOpen}/>)}

        </>
    );
}

