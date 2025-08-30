// Компонент приймає JSON locations, мову.
// З locations формуємо кінцеві адреси для маркерів карти та активний ланцюг для списку
// багаторівневе дерево адрес по містах та регіонах.
// Коли клік на маркері, відкриваємо ланцюг адреса-місто-регіон, центруємо на адресі
// коли клік на місто, центрування на вкладених адресах,
// коли клік на регіоні, центрування на вкладених містах

import L, {
    type LatLngBoundsExpression,
    type LatLngBoundsLiteral,
    type LatLngExpression,
    type LatLngTuple,
    Map,
    type MapOptions
} from "leaflet";
import type {ICity, IMapLocation, IRegion, LangType} from "../../lib/types";
import {useEffect, useRef, useState} from "react";
import "./LeafletMap.css"
import place from "../../assets/place.svg";
import selectedPlace from "../../assets/place_selected.svg";
import LocationList from "./LocationList.tsx";
import {getCoordinates} from "../../utils/getCoordinates.ts";

interface ILeafletMap {
    locations: IMapLocation | null;
    handleClose: () => void;
    isUa: boolean;
}

function createIcon(url: string) {
    return L.icon({
        iconUrl: url,
        iconSize: [16, 28],
        iconAnchor: [-8, 14],
        popupAnchor: [16, -10],
    });
}

export default function LeafletMap(props: ILeafletMap) {
    const {locations, isUa} = props;
    // активний ключ списку та маркера (ключи в об'єкті locations)
    const [activeKey, setActiveKey] = useState('');
    // Мапа
    const mapRef = useRef<Map | null>(null);
    // список маркерів мапи
    const markersRef = useRef<{ [key: string]: L.Marker }>({});
    // координати географічної області на карті (міста, регіона)
    const boundsRef = useRef<{ [key: string]: LatLngBoundsLiteral }>({});
    // об'єкт елементів для можливості розкриття списку
    const itemRefs = useRef<{ [key: string]: HTMLLIElement }>({});

    const lang: LangType = props.isUa ? "ua" : 'ru';
    const tileUrl = {
        "wikimedia": {
            url: `https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=${isUa ? 'uk' : 'ru'}`,
            options: {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, tiles &copy; <a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia Maps</a>'
            }
        },
        "visicom": {
            url: `https://tms{s}.visicom.ua/2.0.0/world,ua/${isUa ? 'base' : 'base_ru'}/{z}/{x}/{y}.png`,
            options: {
                attribution: "Дані карт © 2025 АТ «<a href='https://api.visicom.ua/'>Визіком</a>»",
                subdomains: "123",
                maxZoom: 19,
                tms: true
            }
        },

    }
    // Ініціалізація карти та додавання маркерів
    useEffect(() => {
        if (!locations) return;

        const zoom = 12.5;
        const options: MapOptions = {zoomSnap: 0.1};
        let map: Map;
        const mapCenter: LatLngExpression = [46.47116425, 30.754211024999996];

        if (!mapRef.current) {
            map = L.map("innermap").setView(mapCenter, zoom, options);
            L.tileLayer(tileUrl.visicom.url, tileUrl.visicom.options).addTo(map);
            mapRef.current = map;
        } else {
            map = mapRef.current;
            // Очищення старих маркерів перед додаванням нових
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });
            markersRef.current = {};
        }

        const tempMarkers: { [key: string]: L.Marker } = {};
        const tempListRef: { [key: string]: LatLngBoundsLiteral } = {};
        let southWest: LatLngTuple = [0, 0];
        let northEast: LatLngTuple = [0, 0];
        for (const regionId in locations) {
            let regionSouthWest: LatLngTuple = [0, 0];
            let regionNorthEast: LatLngTuple = [0, 0];
            const region = locations[regionId] as IRegion;
            for (const cityId in region.cities) {
                let citySouthWest: LatLngTuple = [0, 0];
                let cityNorthEast: LatLngTuple = [0, 0];
                const city :ICity = region.cities[cityId];
                for (const zip in city.points) {
                    const point = city.points[zip];
                    const pointName = `Пункт ${zip} ${point.name[lang]}`;
                    const lat = parseFloat(point.location.lat);
                    const lng = parseFloat(point.location.lng);
                    // область отрисовки адресов города
                    const cityCoordinates = getCoordinates(lat, lng, {
                        southWest: citySouthWest,
                        northEast: cityNorthEast
                    })
                    citySouthWest = cityCoordinates.southWest;
                    cityNorthEast = cityCoordinates.northEast;

                    // область отрисовки адресов региона
                    const regionCoordinates = getCoordinates(lat, lng, {
                        southWest: regionSouthWest,
                        northEast: regionNorthEast
                    })
                    regionSouthWest = regionCoordinates.southWest;
                    regionNorthEast = regionCoordinates.northEast;
                    // область отрисовки для всей карты
                    const coordinates = getCoordinates(lat, lng, {southWest, northEast})
                    southWest = coordinates.southWest;
                    northEast = coordinates.northEast;
                    const location: LatLngExpression = [lat, lng];
                    const marker = L.marker(location, {
                        icon: createIcon(place),
                        alt: zip,
                    }).addTo(map);

                    marker.bindPopup(pointName);
                    tempMarkers[zip] = marker;

                    marker.on('click', () => {
                        setActiveKey(zip);
                    });
                }
                // по ключу списка городов получим область отрисовки в пределах города
                tempListRef[cityId] = [cityNorthEast, citySouthWest];
            }
            // по ключу списка региона получим область отрисовки адресов всех городов региона
            tempListRef[regionId] = [regionNorthEast, regionSouthWest];
        }
        markersRef.current = tempMarkers;
        boundsRef.current = tempListRef;
        const bounds = new L.LatLngBounds(southWest, northEast);
        mapRef.current.fitBounds(bounds);
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [locations, isUa]);
    const levels = ['point', 'city', 'region'];
    // розкриття та стилізація вкладених елементів
    const activateLinks = (li: Element, level: string) => {
        // Додаємо клас active до поточного елемента
        li.classList.add('active');

        // Знаходимо індекс поточного рівня
        const levelIndex = levels.indexOf(level);

        if (levelIndex < levels.length - 1) {
            const nextLevel = levels[levelIndex + 1];
            const nextLi = li.closest(`.map-modal__list-item.${nextLevel}`);

            if (nextLi) {
                activateLinks(nextLi, nextLevel);
            }
        }
        return li;
    }
    const itemClickHandler = (key: string) => {
        // При повторному кліку згортаємо / розгортаємо список
        if (key === activeKey) {
            const li = (itemRefs.current[activeKey] as Element).closest('.map-modal__list-item');
            if(li){
                li.classList.toggle('active');
            }


        }
        setActiveKey(key);
    };

    useEffect(() => {
        // при зміні ключа, якщо є відповідний маркер, то центруємо на ньому та змінюємо колір іконки
        if (!markersRef.current || !activeKey) return;

        for (const key in markersRef.current) {
            markersRef.current[key]?.setIcon(createIcon(place));
            markersRef.current[key]?.closePopup();
        }

        // Встановлюємо нову іконку для активного маркера
        const newIcon = createIcon(selectedPlace);
        markersRef.current[activeKey]?.setIcon(newIcon);

        // Переміщення карти до маркера або до центру сукупності маркерів
        const marker = markersRef.current[activeKey];
        if (marker) {
            const position = marker.getLatLng();
            mapRef.current?.flyTo(position, 16, {duration: 0.2});
            marker.openPopup();
        } else {
            const bounds: LatLngBoundsExpression = boundsRef.current[activeKey];
            if (bounds) {
                const calculatedZoom = mapRef.current?.getBoundsZoom(bounds);
                const zoom = calculatedZoom ? calculatedZoom > 11 ? 11 : calculatedZoom : 8;
                mapRef.current?.fitBounds(bounds, {});
                mapRef.current?.setZoom(zoom);
            }
        }

        // також активуємо пункт у списку
        const collection = document.querySelectorAll('.map-modal__list .active');
        if (collection) {
            for (const element of collection) {
                element.classList.remove('active');
            }
        }
        const li = (itemRefs.current[activeKey] as Element).closest('.map-modal__list-item');
        if (li) {
            // Шукаємо, який клас з масиву levels присутній на елементі
            const foundLevel = levels.find(level => li.classList.contains(level));

            if (foundLevel) {
                activateLinks(li, foundLevel as 'point' | 'city' | 'region')
                    .scrollIntoView({block: "end", inline: "nearest", behavior: "smooth"});
            }
        }
    }, [activeKey]);

    if (!locations) {
        return <div id="innermap" className="map-modal__content"></div>;
    }

    return (
        <>
            <div className="map-modal__sidebar">
                <p className="map-modal__title">{isUa ? 'Список відділень' : 'Список отделений'}</p>
                <hr className="map-modal__divider"/>
                <ul className="map-modal__list scrolled">
                    <LocationList
                        locations={locations}
                        lang={lang}
                        itemClickHandler={itemClickHandler}
                        itemsRefs={itemRefs}
                    />
                </ul>
            </div>
            <div id="innermap" className="map-modal__content"></div>
        </>
    );
}
