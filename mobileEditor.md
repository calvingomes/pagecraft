# Mobile Editor Guard (Temporary)

## Purpose

Temporarily block editing on small screens (mobile widths) and show a clear instruction overlay.

## Current Behavior

- If the real screen mode is mobile (`< 960px`), editor shows a blocking overlay:
  - "Open the editor page on a tablet or a desktop to edit."
- Desktop and tablet continue to allow editing.
- Desktop manual preview toggle to mobile still works (this is preview only, not device lockout).

## Implementation Files

- `components/layout/OverlayPopup/OverlayPopup.tsx`
- `components/layout/OverlayPopup/OverlayPopup.module.css`
- `components/layout/MobileEditorGuard/MobileEditorGuard.tsx`
- `app/editor/page.tsx` (wiring via `screenView === "mobile"`)

## Reuse API

`OverlayPopup` is generic and can be triggered by any component.

Props:

- `open: boolean`
- `title: string`
- `message: string`
- `showCloseButton?: boolean`
- `onClose?: () => void`

`MobileEditorGuard` is now a thin wrapper around `OverlayPopup` and also supports:

- `message?: string`
- `showCloseButton?: boolean`
- `onClose?: () => void`

## Remove Later

To remove this temporary guard later:

1. Delete `components/layout/MobileEditorGuard/`.
2. If overlay is no longer used elsewhere, delete `components/layout/OverlayPopup/`.
3. Remove `MobileEditorGuard` import and `<MobileEditorGuard open={isMobileScreen} />` from `app/editor/page.tsx`.
4. Remove `isMobileScreen` variable if no longer used.
