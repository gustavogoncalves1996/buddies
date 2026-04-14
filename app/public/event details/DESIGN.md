# Design System Document: High-End Editorial Specification

## 1. Overview & Creative North Star: "The Artisanal Sanctuary"
This design system moves beyond the "standard app" aesthetic to create a digital space that feels like a quiet, sun-drenched tea house. Our Creative North Star is **The Artisanal Sanctuary**. 

We reject the rigid, clinical grids of modern SaaS in favor of an editorial layout that breathes. By utilizing intentional asymmetry, oversized typography, and deep tonal layering, we create an experience that is both premium and approachable. The goal is to make the user feel as though they are paging through a high-end lifestyle magazine rather than interacting with a database.

---

## 2. Colors: Tonal Depth & Organic Warmth
The color palette is anchored by a vibrant, "fresh-whisked" Matcha green and a warm, biscuit-cream foundation.

### The "No-Line" Rule
**Explicit Instruction:** All designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. To separate a sidebar from a main content area, place a `surface-container-low` (#f6f3ea) section against the base `surface` (#fcf9f0). 

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. Use the surface tiers to define importance:
- **Base Layer:** `surface` (#fcf9f0) for global backgrounds.
- **Content Blocks:** `surface-container-low` (#f6f3ea) for secondary information.
- **Elevated Focus:** `surface-container-highest` (#e5e2da) for active interactive elements or modal-like surfaces.

### Signature Textures & Glassmorphism
- **The Matcha Glow:** Use subtle linear gradients for primary CTAs, transitioning from `primary` (#37602c) to `primary_container` (#4f7942) at a 135-degree angle. This adds "soul" and depth.
- **Frosted Cream:** For floating desktop navigation or overlays, use `surface_container_lowest` (#ffffff) at 80% opacity with a `24px` backdrop-blur. This creates a "frosted glass" effect that allows the warm cream tones to bleed through.

---

## 3. Typography: Editorial Authority
We pair the structural elegance of **Plus Jakarta Sans** with the rhythmic readability of **Be Vietnam Pro**.

- **Display & Headlines (Plus Jakarta Sans):** These are our "editorial moments." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create a bold, confident brand voice. Headlines should often be placed with generous, asymmetrical white space to lead the eye.
- **Body & Titles (Be Vietnam Pro):** Chosen for its organic, slightly rounded terminals that complement our corner radius. `body-lg` (1rem) is the standard for readability, ensuring the "cozy" theme remains accessible.
- **Hierarchical Intent:** Use `on_surface_variant` (#42493e) for secondary body text to reduce visual noise and maintain the soft, low-contrast "cozy" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "digital." We utilize **Tonal Layering** to create a sense of height.

- **The Layering Principle:** Instead of a shadow, place a `surface_container_lowest` (#ffffff) card on a `surface_container` (#f1eee5) background. The shift in brightness creates a natural, soft lift.
- **Ambient Shadows:** When an element must float (e.g., a dropdown or floating action button), use a shadow color tinted with the primary green: `rgba(55, 96, 44, 0.06)` with a `40px` blur and `12px` Y-offset.
- **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., in a high-density table), use the `outline_variant` (#c2c9bb) at 20% opacity. 100% opaque borders are strictly forbidden.

---

## 5. Components: Soft & Intentional

### Desktop Navigation (The "Robust Sidebar")
For desktop, utilize a wide-format side navigation using `surface_container_low`. 
- **Active State:** Use a "pill" shape with `primary_fixed` (#c0f0ad) background and `on_primary_fixed` (#022100) text. 
- **Typography:** Use `title-sm` for nav items to maintain an editorial feel.

### Buttons & Chips
- **Primary Button:** Large rounded corners (`xl`: 3rem). Background: Gradient of `primary` to `primary_container`. Text: `on_primary` (#ffffff).
- **Secondary Button:** `surface_container_highest` background with `on_surface` text. No border.
- **Chips:** Used for "Matcha Strengths" or "Biscuit Flavors." Use `secondary_container` (#f2ddbd) with `md` (1.5rem) rounding to mimic the shape of a finger-biscuit.

### Cards & Lists
- **The "No-Divider" Rule:** Forbid the use of horizontal lines. To separate list items, use `16px` of vertical white space or alternate background tints between `surface` and `surface_container_low`.
- **Card Styling:** Use `lg` (2rem) corner radius. Elements inside the card should have `md` (1.5rem) corners to create a "nested" visual harmony.

### Input Fields
Soft, pill-shaped (`full`: 9999px) fields using `surface_container_highest`. Focus states should transition the background to `primary_fixed` with a subtle `2px` glow of `surface_tint`.

---

## 6. Do's and Don'ts

### Do:
- **Do** use asymmetrical margins. A hero image might be offset to the right with text floating partially over it to create a "layered" look.
- **Do** lean into the cream/green contrast. Use `primary_container` text on `surface` backgrounds for high-end readability.
- **Do** prioritize white space. If a layout feels "crowded," double the padding.

### Don't:
- **Don't** use pure black (#000000). Use `on_surface` (#1c1c17) for all dark text.
- **Don't** use standard `0.5rem` (8px) rounding. Our brand is "Cozy," which requires the more generous `DEFAULT` (1rem) or `lg` (2rem) scales.
- **Don't** use hard-edged images. All imagery must follow the `lg` (2rem) corner radius scale to feel integrated into the system.