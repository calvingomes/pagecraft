/**
 * Type domain for block-specific interfaces and API data structures.
 */

export interface MapResult {
  label: string;
  lat: number;
  lng: number;
}

export interface MapInterfaceProps {
  lat: number;
  lng: number;
  zoom: number;
  isUnlocked: boolean;
  onMoveEnd: (lat: number, lng: number, zoom: number) => void;
  width?: number;
  height?: number;
}

export interface MapSearchPaletteProps {
  onSelect: (result: MapResult) => void;
}

export interface MapboxFeature {
  place_name: string;
  geometry: {
    coordinates: [number, number];
  };
}
