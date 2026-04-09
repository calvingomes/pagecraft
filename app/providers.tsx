'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

/**
 * Analytics Events Reference:
 * - claim_cta_click (Homepage hero) - User clicks Claim button
 * - username_page_cta_click (Username page navbar) - Visitor clicks "Craft your page" CTA
 * - signup_google (Auth page) - First-time signup via Google
 * - signup_github (Auth page) - First-time signup via GitHub
 * - editor_opened (Editor page) - Tracks which editor (mobile/desktop) is loaded
 * - viewport_preview_toggle (Editor page) - Tracks manual switches between desktop/mobile previews
 * - first_save_complete (useEditorData) - Tracks the very first successful page save
 */

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
      
      if (token) {
        posthog.init(token, {
          api_host: host,
          persistence: 'memory',
          capture_pageview: false,
        });
      }
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
