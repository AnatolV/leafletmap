// src/lib/components/LeafletMap/useLeafletMap.ts

import type {IAddresses, ILeafletMapHook, TLeafletMapProps} from "./LeafletMap.types.ts";
import { useEffect, useState } from "react";

const useLeafletMap = (props: TLeafletMapProps): ILeafletMapHook => {
    const {addresses, addressesUrl} = props;
    const [locations, setLocations] = useState<IAddresses | null>(null);
    const [leafletReady, setLeafletReady] = useState(false);
    const [opened, setOpened] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Effect 1: Loads Leaflet CSS when the modal is opened for the first time
    useEffect(() => {
        if (opened && !leafletReady) {
            const loadLeafletResources = () => {
                const link = document.createElement('link');
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                link.rel = 'stylesheet';
                link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
                link.crossOrigin = "";
                document.head.appendChild(link);

                link.onload = () => {
                    setLeafletReady(true);
                };
            };
            loadLeafletResources();
        }
    }, [opened, leafletReady]);

    // Effect 2: Fetches address data based on props
    // This runs only when the 'opened' state becomes true and the URL/addresses change
    useEffect(() => {

        const fetchData = async () => {
            if (addresses) {
                // Case 1: Addresses are passed directly as a prop
                setIsLoading(true);
                setLocations(addresses);
                setIsLoading(false);
            } else if (addressesUrl) {
                // Case 2: A URL is provided, fetch data from there
                setIsLoading(true);
                setError(null);
                try {
                    const response = await fetch(addressesUrl);
                    if (!response.ok) {
                        throw new Error('Ошибка при загрузке данных');
                    }
                    const data: IAddresses = await response.json();
                    setLocations(data);
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        setError(e.message);
                    } else {
                        setError('Произошла неизвестная ошибка');
                    }
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Case 3: No addresses or URL provided
                setLocations(null);
            }
        };

        fetchData();

    }, [opened, addresses, addressesUrl]);


    const handleOpen = () => {
        setOpened(true);
    };

    const handleClose = () => {
        setOpened(false);
    };

    return {
        handleClose,
        handleOpen,
        locations,
        opened,
        isLoading,
        error
    };
};

export default useLeafletMap;
