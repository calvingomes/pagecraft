import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin = (() => {
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl);
  } catch {
    return null;
  }
})();
const isLocalSupabaseHost =
  supabaseOrigin?.hostname === "localhost" ||
  supabaseOrigin?.hostname === "127.0.0.1";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: Boolean(isLocalSupabaseHost),
    remotePatterns: [
      ...(supabaseOrigin
        ? [
            {
              protocol: supabaseOrigin.protocol.replace(":", "") as
                | "http"
                | "https",
              hostname: supabaseOrigin.hostname,
              port: supabaseOrigin.port || undefined,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https" as const,
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
