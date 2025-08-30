export type LangType = "ua" | "ru";
// Описує назву двома мовами
export interface IName {
    ru: string;
    ua: string;
}
export interface ILocation {
    lat: string;
    lng: string;
}
export interface IPoint {
    location: ILocation;
    name: IName;
}
export interface ICity {
    name: IName;
    points: { [key: string]: IPoint };
}
export interface IRegion {
    name: IName;
    cities: { [key: string]: ICity };
}
// IMapLocation може бути об'єктом будь-якого рівня
export type IMapLocation =
    { [key: string]: IRegion } |
    { [key: string]: ICity } |
    { [key: string]: IPoint };
