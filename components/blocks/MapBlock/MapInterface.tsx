"use client";

import React, { useEffect, useRef } from "react";
import Map, { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapInterfaceProps {
  lat: number;
  lng: number;
  zoom: number;
  isUnlocked: boolean;
  onMoveEnd: (lat: number, lng: number, zoom: number) => void;
  width?: number;
  height?: number;
}

export default function MapInterface({
  lat,
  lng,
  zoom,
  isUnlocked,
  onMoveEnd,
  width,
  height,
}: MapInterfaceProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = React.useState({
    latitude: lat,
    longitude: lng,
    zoom: zoom
  });

  useEffect(() => {
    setViewState({
      latitude: lat,
      longitude: lng,
      zoom: zoom
    });
  }, [lat, lng, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Explicit resize trigger when block dimensions change
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      map.resize();
      // Double-fire after a short delay to catch the end of any CSS transitions
      const timer = setTimeout(() => map.resize(), 100);
      return () => clearTimeout(timer);
    }
  }, [width, height]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (mapboxToken === "your_mapbox_token_here") {
      console.warn("Mapbox Token is still set to placeholder in .env.local");
    }
    if (!mapboxToken) {
      console.error("Mapbox Token is missing entirely");
    }
  }, [mapboxToken]);

  return (
    <div 
      style={{ 
        width: "100%", 
        height: "100%", 
        position: "relative",
        zIndex: isUnlocked ? 999 : 1,
        cursor: isUnlocked ? "crosshair" : "default"
      }}
      onPointerDown={(e) => isUnlocked && e.stopPropagation()}
      onMouseDown={(e) => isUnlocked && e.stopPropagation()}
      onTouchStart={(e) => isUnlocked && e.stopPropagation()}
      onWheel={(e) => isUnlocked && e.stopPropagation()}
      onClick={(e) => isUnlocked && e.stopPropagation()}
    >
      {mapboxToken && (
        <Map
          {...viewState}
          ref={mapRef}
          mapboxAccessToken={mapboxToken}
          onMove={evt => setViewState(evt.viewState)}
          onMoveEnd={evt => {
            onMoveEnd(evt.viewState.latitude, evt.viewState.longitude, evt.viewState.zoom);
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          interactive={true}
          dragPan={true}
          scrollZoom={true}
          boxZoom={true}
          doubleClickZoom={true}
          touchZoomRotate={true}
          cooperativeGestures={!isUnlocked}
          attributionControl={false}
        />
      )}
    </div>
  );
}
