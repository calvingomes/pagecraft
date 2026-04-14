import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const zoom = searchParams.get("zoom");
  const w = searchParams.get("w") || "425";
  const h = searchParams.get("h") || "425";
  const size = `${w}x${h}@2x`;
  const style = searchParams.get("style") || "streets-v12";
  
  const apiKey = process.env.MAPBOX_ACCESS_TOKEN;

  if (!lat || !lng || !zoom) {
    return NextResponse.json({ error: "Missing required parameters (lat, lng, zoom)" }, { status: 400 });
  }

  if (!apiKey) {
    console.error("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set in environment");
    return NextResponse.json({ error: "Map service configuration missing" }, { status: 500 });
  }

  try {
    const mapboxUrl = new URL(`https://api.mapbox.com/styles/v1/mapbox/${style}/static/${lng},${lat},${zoom},0,0/${size}`);
    mapboxUrl.searchParams.set("access_token", apiKey);

    const res = await fetch(mapboxUrl.toString(), {
      next: {
        revalidate: 2592000,
      },
    });

    if (!res.ok) {
      console.error(`Mapbox API error: ${res.status} ${res.statusText}`);
      return NextResponse.json({ error: "Failed to fetch map image" }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const imageBuffer = await res.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Static map proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
