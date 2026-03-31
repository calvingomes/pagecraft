# PageCraft Responsive Layout & Styling Rules

To maintain perfect brand consistency and a scalable codebase, any layout or styling changes must strictly follow these foundational rules derived from our previous layout fixes.

## 1. Global Containers & Padding
Always use the abstracted global `.container` utility class (defined in `app/globals.css`) to wrap the inner content of any new section (e.g., Hero, Features, Footer).
- It handles the `max-width: 1260px` and centering automatically.
- **CRITICAL:** It contains built-in responsive safe-area buffering (`padding: 0 24px` on desktop, `padding: 0 20px` on mobile). 
- Do **NOT** add horizontal padding (`padding-left`, `padding-right`) to the outer section wrappers (like `.hero`), as `.container` securely prevents the content from hitting the screen edges.

## 2. Typography & Clamps
Never write custom font sizes (e.g., `font-size: 16px`) or custom `clamp()` expressions directly inside CSS `.module.css` files. 
Always use variables directly from `styles/fonts.css`.

**A. Fluid Headings:**
For text that needs to responsively shrink across devices, use the fluid variables. This eliminates the need to write typography `@media` overrides!
- `--font-size-fluid-display`: `clamp(40px, 6vw, 80px)` (Massive Hero Titles)
- `--font-size-fluid-h1`: `clamp(32px, 5vw, 64px)` (Section Headers)
- `--font-size-fluid-h2`: `clamp(26px, 4vw, 48px)`
- `--font-size-fluid-h3`: `clamp(22px, 3vw, 36px)`
- `--font-size-fluid-xl`: `clamp(18px, 2.5vw, 24px)`
- `--font-size-fluid-lg`: `clamp(16px, 2vw, 20px)` (Subtitles/Leads)

**B. Fixed UI Text:**
For rigid elements like inputs, buttons, and system text, use the absolute scale: `var(--font-size-sm)`, `var(--font-size-md)`, `var(--font-size-lg)`.

## 3. Responsive Architecture (Desktop-First)
We author CSS **Desktop-First**. Write your base styles at the top of the file without queries, aiming at a large desktop.
- Override for tablets using `@media (--bp-tablet)` (960px to 1359px).
- Override for phones using `@media (--bp-mobile)` (< 960px).
- **Rule:** Do not duplicate rules across both blocks if one rule serves both. However, since `--bp-tablet` and `--bp-mobile` are mutually exclusive, duplicating layout shifts (like `flex-direction: column`) in both blocks is occasionally required and accepted.

## 4. Input & Component Constraints
When dealing with forms or floating actionable UI (like `ClaimInput`):
- Avoid fixed `px` widths that stretch or overflow. Use `width: 100%` paired with a strict `max-width` (e.g., `max-width: 480px`).
- Always protect minimum constraints against extreme screen narrowness: Use `min-width: min(100%, 320px)` instead of `min-width: 320px` to guarantee it never busts out of the `.container`'s 20px edge padding on narrow iPhones.

## 5. CSS Redundancy (Don'ts)
- Do **not** apply `margin: 0 auto;` to elements whose parent is a flex container with `align-items: center;`.
- Do **not** declare `position: absolute; inset: 0; width: 100%; height: 100%;` on elements mapped to `<Image fill />`. Next.js forcefully injects these positioning rules inline.
- Do **not** declare `background-size: cover;` on elements where `background` is simply a solid color variable.

## 6. Color Opacities & Glass Mating
When creating transparent overlays or softer variations of a global color variable, do **not** use a hardcoded Hex code with an alpha slice (e.g. `#ffffff44`). 
- **Rule:** Use the native CSS4 `color-mix` engine to inject transparency directly into the design system variables:
  `background-color: color-mix(in srgb, var(--color-white) 27%, transparent);`

## 7. Motion & Animations
Never hardcode raw `cubic-bezier()` functions (or basic `ease` properties) into a CSS module unless strictly unique.
- Use `var(--ease-snappy)` (`0.16, 1, 0.3, 1`) for hyper-premium, aggressive 'fast-out/slow-in' GUI snappy motions.
- Use `var(--ease-bouncy)` (`0.68, -0.55, 0.265, 1.55`) for elastic effects.
- Use `var(--ease-standard)` for generic smooth transitions.
- **Rule:** For complex icon swaps on hover, rely on dual SVGs sliding through clipped wrappers (`overflow: hidden;`) utilizing `transform: translateX()` rather than generic `scale()` or `rotate()` trickery.

## 8. File Structure & Typing
In strict alignment with the `AGENTS.md` protocol:
- **Never** define Component Props (`interface [Component]Props`) inside the `.tsx` UI render file. 
- **Rule:** Always extract those types into their own explicitly localized `*.types.ts` registry directly next to the component (e.g., `ThemeButton.types.ts`) and `import type { ThemeButtonProps }` them cleanly.
