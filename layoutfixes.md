# PageCraft Responsive Layout & Styling Rules

To maintain perfect brand consistency and a scalable codebase, any layout or styling changes must strictly follow these foundational rules.

## 1. Global Containers & Padding
Always use the abstracted global `.container` utility class (defined in `app/globals.css`) to wrap the inner content of any new section.
- It handles the `max-width: 1260px` and centering automatically.
- **CRITICAL:** It contains built-in responsive safe-area buffering (`padding: 0 48px` on tablet, `padding: 0 20px` on mobile/desktop). 
- Do **NOT** add horizontal padding (`padding-left`, `padding-right`) to outer section wrappers, as `.container` securely prevents content from hitting the screen edges.

## 2. Typography & Clamps
Never write custom font sizes or custom `clamp()` expressions directly inside CSS `.module.css` files. Always use variables directly from `styles/fonts.css`.

**A. Fluid Headings:**
For text that needs to responsively scale across devices, use the fluid variables to eliminate the need for typography `@media` overrides.
- **Massive Display**: `--font-size-fluid-display` (`40px` to `80px`) — Primary impact headings.
- **Brand Marquee**: `--font-size-fluid-brand` (`96px` to `200px`) — Edge-to-edge decorative text.
- **Heading 1**: `--font-size-fluid-h1` (`40px` to `56px`) — Standard section headers.
- **Heading 1 (Alt)**: `--font-size-fluid-h1-secondary` (`32px` to `48px`) — Compressed headers.
- **Heading 2 (High)**: `--font-size-fluid-h2-plus` (`28px` to `52px`) — Impactful subtitles.
- **Heading 2 (Base)**: `--font-size-fluid-h2` (`26px` to `48px`) — Component titles.
- **Secondary UI**: `--font-size-fluid-lg` (`16px` to `20px`) — Sub-text and descriptors.

**B. Fixed UI Text:**
For rigid elements like inputs, buttons, and small labels, use the absolute scale: `var(--font-size-sm)`, `var(--font-size-md)`, `var(--font-size-lg)`.

## 3. Responsive Architecture (Desktop-First)
We author CSS **Desktop-First**. Base styles are written without overrides, targeting a high-resolution desktop.
- Override for tablets using `@media (--bp-tablet)` (960px to 1359px).
- Override for phones using `@media (--bp-mobile)` (< 960px).
- **Rule:** Do not duplicate rules if one serves both. If a layout shift (like `flex-direction: column`) is required for both mobile and tablet, standardizing the change at the tablet level is preferred.

## 4. Component Constraints
Always protect minimum and maximum constraints against extreme screen narrowness or width:
- Use `width: 100%` paired with a strict `max-width` for any isolated floating or centered UI elements.
- Use `min-width: min(100%, 320px)` to guarantee a component never overflows the `.container` horizontal padding on narrow devices.

## 5. CSS Redundancy (Don'ts)
- Do **not** apply `margin: 0 auto;` to elements whose parent is a flex container with `center` alignment.
- Do **not** declare `position: absolute; inset: 0; width: 100%; height: 100%;` on elements mapped to `<Image fill />` as Next.js handles this automatically.
- Do **not** declare `background-size: cover;` on elements where `background` is a solid color.

## 6. Color Opacities
Avoid using hardcoded Hex codes with alpha slices (e.g. `#ffffff44`). 
- **Rule:** Use the native CSS `color-mix` engine to inject transparency into design system variables:
  `background-color: color-mix(in srgb, var(--color-white) 27%, transparent);`

## 7. Motion & Animations
Standardize on the global bezier motions to ensure a premium GUI feel:
- Use `var(--ease-snappy)` (`0.16, 1, 0.3, 1`) for high-velocity interface interactions.
- Use `var(--ease-bouncy)` for elastic elements.
- **Rule:** For complex icon swaps on hover, prefer sliding SVG translations through clipped wrappers (`overflow: hidden;`) over generic scaling or rotation.

## 8. File Structure & Typing
- **Never** define Component Props inside the `.tsx` UI render file. 
- **Rule:** Always extract types into their own localized `*.types.ts` registry directly next to the component and use `import type` cleanly.

## 9. Layout Design Philosophy
- **Fluidity First:** Always prefer fluid variables first to minimize the amount of device-specific overrides needed.
- **Clean Transitions:** When stacking elements vertically on mobile, ensure the alignment feels native to the page rhythm (usually left-aligned for long-form content, centered only for brief hero callouts).
