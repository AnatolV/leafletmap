import { useEffect, useState } from 'react'
import './App.css'
import type {IMapLocation} from "./lib/types.js";
import LeafletMap from "./components/LeafletMap/LeafletMap";
import {Button} from "./components/Button/Button";



function App() {
  const [locations, setLocations] = useState<IMapLocation | null>(null);
  const [leaflet, setLeaflet] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    // Логіка завантаження ресурсів буде виконана, тільки якщо `opened` true
    if (opened && !leaflet) {
      const loadResources = async () => {
        try {
          // Завантаження даних з JSON-файлу
          const response = await fetch('/data/location.json');
          const data = await response.json();
          setLocations(data);

          // Динамічне завантаження CSS-стилів Leaflet
          const link = document.createElement('link');
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.rel = 'stylesheet';
          link.integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin="";
          document.head.appendChild(link);
          link.onload = () => {
            setLeaflet(true);
          };

        } catch (error) {
          console.error("Помилка завантаження ресурсів:", error);
        }
      };
      loadResources();
    }

  }, [opened,leaflet]);
  const getLanguage = () => {
    const url = window.location.href;
    return url.includes('/ru/') ? 'ru' : 'ua';
  };
  const isUa = getLanguage() === 'ua';

  const handleOpen = () => {
    setOpened(true);
  };

  const handleClose = () => {
    setOpened(false);
  };

  return (
      <>
        {opened && (
            <>
              <div className="map-overlay" onClick={handleClose}></div>
              <div className="map-modal">
                <div className="map-modal__close" onClick={handleClose}>x</div>
                <LeafletMap locations={locations} handleClose={handleClose} isUa={isUa}/>
              </div>
            </>
        )}
        <Button isUa={isUa} handleOpen={handleOpen}/>
      </>
  );
}

export default App;
