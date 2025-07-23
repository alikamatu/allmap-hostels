declare module '@mapbox/mapbox-gl-geocoder' {
  import { IControl } from 'mapbox-gl';

  interface GeocoderOptions {
    accessToken?: string;
    mapboxgl?: any;
    marker?: boolean | object;
    flyTo?: boolean | object;
    placeholder?: string;
    proximity?: object;
    trackProximity?: boolean;
    collapsed?: boolean;
    clearAndBlurOnEsc?: boolean;
    clearOnBlur?: boolean;
    box?: boolean;
    countries?: string;
    types?: string;
    minLength?: number;
    limit?: number;
    language?: string;
    zoom?: number;
    localGeocoder?: Function;
    filter?: Function;
    origin?: string;
    reverseMode?: 'distance' | 'score';
    routing?: boolean;
    autocomplete?: boolean;
    fuzzyMatch?: boolean;
    bbox?: number[];
    mapboxgl?: any;
  }

  export default class MapboxGeocoder implements IControl {
    constructor(options: GeocoderOptions);
    onAdd(map: mapboxgl.Map): HTMLElement;
    onRemove(): void;
    getResult(): any;
    query(query: string): void;
    setInput(value: string): void;
    clear(): void;
    // Add more methods as needed
  }
}
