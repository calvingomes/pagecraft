"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./MapSearchPalette.module.css";

interface MapResult {
  label: string;
  lat: number;
  lng: number;
}

interface MapSearchPaletteProps {
  onSelect: (result: MapResult) => void;
}

export function MapSearchPalette({ onSelect }: MapSearchPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/map/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  return (
    <div
      className={styles.container}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className={styles.results}
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {isLoading && <div className={styles.loading}>Searching...</div>}
        {!isLoading && query.length >= 3 && results.length === 0 && (
          <div className={styles.noResults}>No places found</div>
        )}
        {results.map((result, idx) => (
          <button
            key={`${result.lat}-${result.lng}-${idx}`}
            className={styles.resultItem}
            onClick={() => onSelect(result)}
          >
            {result.label}
          </button>
        ))}
      </div>

      <input
        autoFocus
        type="text"
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a place..."
        spellCheck={false}
      />
    </div>
  );
}
