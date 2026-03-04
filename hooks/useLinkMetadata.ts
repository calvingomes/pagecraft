import { useEffect, useRef } from "react";
import type { LinkMetadataResponse } from "@/types/editor";

type UseLinkMetadataProps = {
  url: string;
  initialUrl?: string;
  enabled: boolean;
  onSuccess: (meta: LinkMetadataResponse) => void;
};

export function useLinkMetadata({
  url,
  initialUrl = "",
  enabled,
  onSuccess,
}: UseLinkMetadataProps) {
  const lastFetchedUrl = useRef<string>(initialUrl);
  const timer = useRef<number | null>(null);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!enabled) return;

    // Avoid repeated fetches for the same url.
    if (url === lastFetchedUrl.current) return;

    if (timer.current) {
      window.clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/link-metadata?url=${encodeURIComponent(url)}`,
        );
        if (!res.ok) return;
        const meta = (await res.json()) as LinkMetadataResponse;

        lastFetchedUrl.current = url;
        if (onSuccessRef.current) {
          onSuccessRef.current(meta);
        }
      } catch {
        // ignore
      }
    }, 400);

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
    };
  }, [url, enabled]); // Removed onSuccess from dependencies
}
