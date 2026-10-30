# Ondar Storefront Template Design & Theming Specification

This document details the visual and behavioral specification for Ondar's 4 storefront templates: **Default (Ondar Minimal)**, **Fashion (Zuri Luxe)**, **Food (Mama's Kitchen)**, and **Electronics (Cyber Tech)**.

---

## Core Guiding Principles (Truthful Commerce)
1. **Preserve Real Commerce Data:** All prices, stock quantities, cart calculations, order hold expirations, and checkout flows remain strictly untouched.
2. **No Invented Merchant Promises:** No hard-coded "Open now," dispatch promises, fake warranties, fake delivery pricing, or fake meal extras. Everything rendered must be rooted in real merchant profile or product data from the database.
3. **Truthful Variants & Availability:** If a product has real color/size variants in the DB, render real swatches and size buttons. If a product does not have variants, render a direct add-to-bag experience.
4. **Shared Commerce Engine:** Templates share the exact same underlying `CartProvider`, `useCart()`, and checkout routes. Templates vary by layout, typography, palette, card styling, and navigation presentation.
5. **Non-Destructive Live Preview:** Any user can visit `/s/[slug]?previewTemplate=default|fashion|food|electronics` to preview candidate templates without mutating the database. Links carry the active preview parameter between catalog and PDP seamlessly, and a top preview banner is shown with an "Exit preview" action.

---

## 1. Fashion Template (`fashion`)
*Reference: Zuri Luxe Fashion (`media_1793318713579_fc0c23bd.png` & `media_1793318713582_137acf93.png`)*

- **Visual Personality:** Editorial, high-fashion boutique, refined atelier luxury.
- **Typography:**
  - Headings / Logo: High-contrast Serif (`font-serif font-black tracking-[0.2em]`).
  - Body / UI: Clean, understated neutral sans (`font-sans`).
  - Microcopy: Uppercase bold labels (`tracking-wider text-[11px] font-extrabold`).
- **Colour Palette:**
  - Primary: Pure Black (`#000000`, `bg-neutral-900`).
  - Background: Crisp Warm White (`#FDFDFD`, `#FFFFFF`).
  - Cards: Soft slate-gray placeholder (`#E5E7EB`).
  - Accents: Subdued amber for real low stock (`#B45309`).
- **Spacing / Grid:**
  - 2-column portrait grid (`aspect-[3/4]`, `gap-x-3.5 gap-y-7`).
  - Padding: `px-4 max-w-[440px] mx-auto` mobile-first container.
- **Card Design:**
  - Clean portrait card with full-height image.
  - Real availability badges: `Sold out` or `Only X left` (if real stock <= 3).
  - Serif product name with clean Naira pricing.
- **Product Detail Page (PDP):**
  - Full-width portrait hero image (`aspect-[3/4]`).
  - Variants: Selectable option chips mapped strictly from real product variants (if present).
  - High-impact black `ADD TO BAG · ₦...` button.
  - Truthful WhatsApp inquiry button with pre-filled message.

---

## 2. Food & Kitchen Template (`food`)
*Reference: Mama Tola's Kitchen (`media_1793318713503_f6980a82.png` & `media_1793318713575_e0a233b2.png`)*

- **Visual Personality:** Warm, appetizing, artisanal kitchen, home-cooked community hospitality.
- **Typography:**
  - Headings / Logo: Soft, warm serif (`font-serif font-black`).
  - Body: Readable geometric sans (`font-sans font-medium`).
- **Colour Palette:**
  - Primary: Warm Terracotta / Paprika (`#BA3C1D`, `#B83818`).
  - Hero Card / Accents: Soft peach / warm sand (`#FCE7D2`, `#F9E2CD`).
  - Neutral: Dark warm charcoal (`#4A4543`).
- **Spacing / Grid:**
  - 2-column culinary grid (`aspect-square` or `aspect-[4/5]`, `gap-3.5`).
- **Card Design:**
  - Generous `rounded-2xl` corners on food imagery.
  - Floating circular `+` quick-add button in card corner for rapid ordering.
  - Real stock badge: `Sold out` if depleted in DB.
- **Product Detail Page (PDP):**
  - Culinary photo aspect ratio (`aspect-[16/10]`).
  - Real variant selection (if merchant configured portion or meal options).
  - Quantity stepper (`- 1 +`).
  - Terracotta pill `Add to order · ₦...` CTA.
- **Floating Cart Bar:**
  - Displays truthful bag item count and subtotal: `View Cart (${totalCount}) · ₦${subtotalNaira}`.

---

## 3. Electronics & Gadgets Template (`electronics`)
*Reference: Cyber Tech & Computer Village Dark Theme*

- **Visual Personality:** High-density, dark slate tech terminal, precision gadget store.
- **Typography:**
  - Headings: Crisp bold sans with uppercase technical labels.
  - Monospace: Currency values, SKUs, and tech specs.
- **Colour Palette:**
  - Background: Dark slate (`#0F172A`, `#1E293B`).
  - Primary / Highlights: Electric Cyan (`#38BDF8`), Emerald accents (`#10B981`).
  - Card Surface: Darker Slate (`#1E293B`, `border-slate-800`).
- **Card Design:**
  - 2-column dark tech grid with 1-tap quick add.
  - Real availability chips.
- **Product Detail Page (PDP):**
  - Fully coherent dark slate PDP with tech spec summaries and electric cyan CTA.

---

## 4. Default Template (`default`)
*Reference: Ondar Minimal*

- **Visual Personality:** Universal, light, distraction-free Nigerian commerce.
- **Typography:** Modern clean sans (`Geist` / `Inter`).
- **Colour Palette:** Ondar Emerald (`#00A859`), neutral white, soft grays.
- **Card Design:** Universal catalog feed with category chips, search bar, and cart drawer.

---

## 5. Mapping of Reference Elements to Implemented Components

| Reference Element (from Screenshots) | Original Screenshot Feature | Truthful Commerce Implemented Component | File Location |
|---|---|---|---|
| **Fashion: Serif Header** | ZURI boutique serif branding | `FashionCatalogClient` & `FashionProductClient` serif logo & title | `src/components/storefront/customer/FashionCatalogClient.tsx`, `FashionProductClient.tsx` |
| **Fashion: Circular Category Row** | Circular category stories ("Dresses", "Tops"...) | Dynamically extracted from real product categories (`products.map(p => p.category)`); hidden cleanly if no categories exist | `FashionCatalogClient.tsx` |
| **Fashion: 2-Col Portrait Cards** | 3:4 aspect ratio portrait imagery | `relative aspect-[3/4]` portrait grid with hover transitions and truthful stock badges | `FashionCatalogClient.tsx` |
| **Fashion: PDP Hero & Options** | Portrait image, color circles, size boxes, bespoke add-on | Portrait hero image with real variant option chips; no fake bespoke fees or fake size guides | `FashionProductClient.tsx` |
| **Food: Kitchen Peach Banner** | "Home-cooked meals delivered hot" + "Open now · closes 8pm" | `bg-[#FCE7D2]` warm peach banner rendering merchant's real business name, location, and description | `FoodCatalogClient.tsx` |
| **Food: 1-Tap Quick Add `+`** | Floating `+` button on food cards | Floating circular quick-add button that calls `addItem()` for 1 unit of real product at real price | `FoodCatalogClient.tsx` |
| **Food: Category Tabs** | Horizontal category scroll ("All", "Rice", "Soups"...) | Dynamic category tabs from database products; hidden if merchant has no categories | `FoodCatalogClient.tsx` |
| **Food: Floating Bottom Cart Bar** | Charcoal bar with "Minimum order ₦5,000" / "View Cart" | Floating bar with truthful total count and subtotal (`₦${subtotalNaira}`); no invented minimum order claims | `FoodCatalogClient.tsx` |
| **Food: PDP Portion & Quantity Stepper** | Portion toggle, extra chicken/plantain checkboxes, stepper | Truthful variant selector (if configured), stepper (`- 1 +`), dynamic total calculation, terracotta CTA | `FoodProductClient.tsx` |
| **Electronics: Dark Grid & PDP** | Dark slate tech theme, spec chips, monospace price | Full dark theme catalog (`ElectronicsCatalogClient`) and dedicated dark PDP (`ElectronicsProductClient`) | `ElectronicsCatalogClient.tsx`, `ElectronicsProductClient.tsx` |
| **Shared: Non-Destructive Preview** | Previewing alternative storefront vibes | `resolveTemplateId(profile.templateId, previewTemplate)` + top notification banner + query param persistence | `src/app/s/[slug]/page.tsx`, `src/app/s/[slug]/p/[productSlug]/page.tsx` |

---

## 6. Documented Missing Data Fields (For Future Database Enhancements)

The following capabilities were suggested in visual mocks but are **not currently present in Ondar's database schema**. Under strict Truthful Commerce rules, they are **omitted from production storefronts rather than hardcoded or faked**. If Ondar decides to support them in the future, the following database fields should be added:

1. **Store Operating Hours (`BusinessProfile` model):**
   - *Suggested Fields:* `openingHours Json?` or `isOpen Boolean?`, `closingTime String?`
   - *Purpose:* Allows food and local retail vendors to truthfully display "Open now · closes at 8:00 PM" based on merchant schedule.
2. **Order Modifiers & Food Extras (`ProductModifier` / `ProductAddon` models):**
   - *Suggested Table:* `ProductAddon` (`id`, `productId`, `name`, `priceKobo`, `maxQuantity`)
   - *Purpose:* Allows restaurants to configure custom side dishes or toppings (e.g. "Extra Chicken +₦1,500", "Fried Plantain +₦500") that add to checkout totals safely.
3. **Store Minimum Order Amount (`BusinessProfile` model):**
   - *Suggested Field:* `minOrderKobo BigInt?`
   - *Purpose:* Allows restaurants/wholesalers to enforce and display a verified minimum checkout amount.
4. **Bespoke Measurement / Tailoring Fees (`Product` model):**
   - *Suggested Field:* `customMeasurementsFeeKobo BigInt?`, `allowCustomMeasurements Boolean @default(false)`
   - *Purpose:* Enables bespoke fashion tailors to offer custom measurement add-ons without hacking standard product variants.
5. **Size Guides & Measurements Chart (`Product` / `BusinessProfile` models):**
   - *Suggested Field:* `sizeGuideTable Json?` or `sizeGuideImageUrl String?`
   - *Purpose:* Allows fashion brands to provide truthful garment measurements (bust, waist, hips, length) per category.
6. **Hardware Warranty & Guarantee Terms (`Product` model):**
   - *Suggested Field:* `warrantyMonths Int?`, `warrantyDescription String?`
   - *Purpose:* Allows electronics vendors to display verified manufacturer or store warranty terms per product.

---

## Responsive & Accessibility Standards
- **Mobile First:** Optimized at 375px viewport width, seamlessly scaling to desktop with a clean max-width container (`max-w-[480px]` or desktop multi-column container).
- **Accessible Contrast:** All text meets WCAG AA contrast (minimum 4.5:1).
- **Semantics:** Native `<button>`, `<Link>`, and `<input>` elements with visible focus rings.
- **Non-Destructive Preview:** Template switcher and `?previewTemplate=` query param work without mutating merchant profile.
