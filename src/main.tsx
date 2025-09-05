import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {LeafletMap} from "./lib";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LeafletMap locale={'uk'} tileProvider={'visicom'} addressesUrl={'/data/location.json'}/>
  </StrictMode>,
)
