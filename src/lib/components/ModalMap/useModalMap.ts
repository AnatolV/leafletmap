// src/app/map/_components/ModalMap/useModalMap.ts
import {useEffect, useRef, useState} from "react";
import L, {
    type LatLngBoundsExpression,
    type LatLngBoundsLiteral,
    type LatLngExpression,
    type LatLngTuple,
    Map,
    type MapOptions
} from "leaflet";
import place from "../../../assets/images/place.svg";
import selectedPlace from "../../../assets/images/place_selected.svg";
import type {TBounds, TModalMapProps} from "./ModalMap.types.ts";
import type {IAddresses} from "../LeafletMap/LeafletMap.types.ts";

function createIcon(url: string) {
    return L.icon({
        iconUrl: url,
        iconSize: [16, 28],
        iconAnchor: [-8, 14],
        popupAnchor: [16, -10],
    });
}

/**
 * Об'єднує два набори граничних координат в один, який охоплює обидва.
 * @param currentBounds - Поточні загальні координати.
 * @param newBounds - Нові координати, які потрібно додати.
 * @returns - Новий, об'єднаний набір координат.
 */
const mergeBounds = (currentBounds: TBounds | null, newBounds: TBounds): TBounds => {
    if (!currentBounds) {
        return newBounds; // Если общих координат еще нет, возвращаем новые
    }

    const southWest: LatLngTuple = [
        Math.min(currentBounds.southWest[0], newBounds.southWest[0]), // min lat
        Math.min(currentBounds.southWest[1], newBounds.southWest[1]), // min lng
    ];

    const northEast: LatLngTuple = [
        Math.max(currentBounds.northEast[0], newBounds.northEast[0]), // max lat
        Math.max(currentBounds.northEast[1], newBounds.northEast[1]), // max lng
    ];

    return {southWest, northEast};
};
export default function useModalMap(props: TModalMapProps) {
    const {locations, locale, tileProvider} = props;
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

    const tileUrl = {
        "wikimedia": {
            url: `https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?locale=${locale}`,
            options: {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, tiles &copy; <a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia Maps</a>'
            }
        },
        "visicom": {
            url: `https://tms{s}.visicom.ua/2.0.0/world,ua/${locale === 'ru' ? 'base_ru' : 'base'}/{z}/{x}/{y}.png`,
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
            L.tileLayer(tileUrl[tileProvider].url, tileUrl[tileProvider].options).addTo(map);
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


// Очищаємо тимчасові сховища перед запуском
        const tempMarkers: { [key: string]: L.Marker } = {};
        const tempListRef: { [key: string]: LatLngBoundsLiteral } = {};
        const processItems = (items: IAddresses): TBounds | null => {
            if (!items) return null;

            // Локальні граничні координати для поточного рівня вкладеності (для всіх items)
            let levelBounds: TBounds | null = null;

            for (const id of Object.keys(items)) {
                const item = items[id];
                const children = item.list;

                if (!children && item.location) {
                    // Рівень 3: Відділення (базовий випадок рекурсії)
                    const lat = parseFloat(item.location.lat);
                    const lng = parseFloat(item.location.lng);

                    // Межі для однієї точки – це сама точка
                    const itemBounds: TBounds = {
                        southWest: [lat, lng],
                        northEast: [lat, lng],
                    };

                    // Об'єднуємо координати цієї точки із загальними координатами поточного рівня
                    levelBounds = mergeBounds(levelBounds, itemBounds);

                    const name = `Пункт ${id} ${item.name[locale]}`;
                    const location: LatLngExpression = [lat, lng];
                    const marker = L.marker(location, {
                        icon: createIcon(place),
                    }).addTo(map);

                    marker.bindPopup(name);
                    tempMarkers[id] = marker;
                    marker.on('click', () => setActiveKey(id));

                } else if (children) {
                    // Рівень 1 або 2: Регіон або Місто (рекурсивний випадок)

                    // 1. Рекурсивно викликаємо функцію для дочірніх елементів
                    const childBounds = processItems(children);

                    if (childBounds) {
                        // 2. Сохраняем вычисленные границы для этого дочернего элемента (города или региона)
                        tempListRef[id] = [childBounds.northEast, childBounds.southWest];

                        // 3. Об'єднуємо межі цієї child із загальними межами поточного рівня
                        levelBounds = mergeBounds(levelBounds, childBounds);
                    }
                }
            }

            // Повертаємо об'єднані кордони для всіх елементів на цьому рівні
            return levelBounds;
        };

        const globalBounds = processItems(locations);

// 1. GlobalBounds - загальні межі всім відділень.
// 2. tempListRef - об'єкт, де кожного ключа регіону чи міста зберігаються його власні граничні координати.
        if (globalBounds) {
            console.log("Глобальные граничные координаты:", globalBounds);
            // Наприклад, можна відцентрувати карту за цими координатами
            // map.fitBounds([globalBounds.southWest, globalBounds.northEast]);
        }
        console.log("Граничные координаты по уровням:", tempListRef);
        markersRef.current = tempMarkers;
        boundsRef.current = tempListRef;
        if (globalBounds) {
            const bounds = new L.LatLngBounds(globalBounds.northEast, globalBounds.southWest);
            mapRef.current.fitBounds(bounds);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [locations, locale, tileProvider]);
    const levels = ['level_3', 'level_2', 'level_1'];
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
            if (li) {
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
                activateLinks(li, foundLevel as 'level_1' | 'level_2' | 'level_3')
                    .scrollIntoView({block: "end", inline: "nearest", behavior: "smooth"});
            }
        }
    }, [activeKey]);
    return {
        itemClickHandler,
        itemRefs
    };
}
