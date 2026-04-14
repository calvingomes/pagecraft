import { NextRequest, NextResponse } from "next/server";
import type { MapResult, MapboxFeature } from "@/types/blocks";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const apiKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (!apiKey) {
    console.error("MAPBOX_ACCESS_TOKEN is not set");
    return NextResponse.json({ error: "Search service unavailable" }, { status: 500 });
  }

  try {
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
    url.searchParams.set("access_token", apiKey);
    url.searchParams.set("limit", "5");

    const res = await fetch(url.toString(), {
      headers: {
        "accept": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    
    const results: MapResult[] = data.features.map((f: MapboxFeature) => ({
      label: f.place_name,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error("Geocoding proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
