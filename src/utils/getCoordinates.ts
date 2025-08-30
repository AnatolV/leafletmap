import type {LatLngTuple} from "leaflet";

export function getCoordinates(
    lat:number,
    lng:number,
    bounds:{southWest: LatLngTuple,northEast: LatLngTuple}
){
    const southWest = bounds.southWest;
    const northEast = bounds.northEast;

    if (!northEast[0] && !southWest[0]) {
        northEast[0] = southWest[0] = lat;
    }
    if (!northEast[1] && !southWest[1]) {
        northEast[1] = southWest[1] = lng;
    }
    if (lat > northEast[0]) {
        northEast[0] = lat;
    }
    if (lng > northEast[1]) {
        northEast[1] = lng;
    }
    if (lat < southWest[0]) {
        southWest[0] = lat;
    }
    if (lng < southWest[1]) {
        southWest[1] = lng;
    }

    return {southWest:southWest,northEast:northEast}
}
