# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is a restaurant reservation booking site ("KokTable", Phnom Penh). The app is organized by concern, not by page — start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; wraps `App` in `BrowserRouter`, imports `src/index.css`, mounts into `#root`
- `src/app/App.tsx` - Route table (`react-router-dom`) plus the Nav/Footer chrome; the usual starting point for navigation-level changes
- `src/pages/*.tsx` - One component per route (`Home`, `SearchResults`, `RestaurantDetail`, `Checkout`, `Confirmation`, `Login`, `MyBookings`, `ManageBooking`, `NotFound`). Wired to paths in `src/app/App.tsx`
- `src/components/layout/` - `Nav`, `Footer`, `ScrollToTop`, `LanguageSwitcher` — app chrome shared across pages
- `src/components/ui/` - shadcn/ui primitives (`button`, `input`, `textarea`, `label`, `select`, `popover`, `calendar`, `badge`, `dropdown-menu` — lowercase filenames, shadcn convention) plus a few composed/domain components on top: `date-picker` (Popover+Calendar), `Chip`, `PartySizeStepper`, `StatusBadge` (wraps `badge`), `Rating`, `FormField` (wraps `label`)
- `src/components/restaurant/` - `RestaurantCard` (grid) / `RestaurantListItem` (row) — reused by `Home` and `SearchResults`
- `src/data/` - Mock `restaurants.ts` and `bookings.ts`, standing in for a backend. Swap these for real API calls when integration starts; page components should keep calling the same `findRestaurantById` / `findBookingByRef` shape
- `src/types/` - `Restaurant`/`Booking`/checkout-flow types (`ReservationDraft`, `ContactDetails`, `ConfirmedBooking`)
- `src/lib/` - `constants.ts` (route paths via `ROUTES`, brand, party-size bounds), `format.ts` (date/price/Unsplash URL helpers), `validation.ts` (contact-form validation, mock booking-ref generator — returns i18n key codes, not display text), `utils.ts` (`cn()` class merger, `selectItems()` — builds the value→label map shadcn's `Select` needs)
- `src/hooks/` - `useDisclosure` (open/close panel state), `usePartySize` (bounded guest-count stepper)
- `src/i18n.ts` - react-i18next config; imports all four `src/locales/*/translation.json` files and initializes with browser-language detection (localStorage-cached)
- `src/locales/{en,zh,km,ko}/translation.json` - One flat-per-namespace JSON per language, keyed by page/section (`nav.*`, `home.*`, `checkout.*`, ...). **All four currently hold identical English text** — only `en` has been written with real content; `zh`/`km`/`ko` are placeholders sharing the same keys, pending real translation. When adding a new UI string, add the key to all four files (or at minimum `en`, then copy) so `t()` never falls through silently
- `src/index.css` - Global CSS entrypoint, Tailwind CSS v4 import, shadcn's `@theme`-driven semantic tokens (`--background`, `--primary`, `--border`, etc., defined in `:root`/`.dark`) remapped to the brand palette, plus the original brand-named tokens (`--color-terra`, `--color-ink`, ...) — both systems resolve to the same colors; use whichever token name reads more clearly at the call site
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `components.json` - shadcn/ui CLI config (`npx shadcn add <component>`) — style `base-nova`, Base UI (not Radix) under the hood
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

### shadcn/ui conventions

- Components live in `src/components/ui/` with shadcn's lowercase filenames (`button.tsx`, not `Button.tsx`) — this repo is on a case-insensitive filesystem, so a stray capitalized duplicate will silently collide with these; don't reintroduce one.
- `Button`'s variant vocabulary is shadcn's own (`default | outline | secondary | ghost | destructive | link`), not the earlier custom `primary/secondary/ghost` set. There's no `fullWidth` prop — use `className="w-full"` for standalone buttons or `className="flex-1"` for buttons sharing a row.
- `Button`, `Input`, and `SelectTrigger` were bumped from shadcn's compact defaults (~32px) to ~40px (`lg` ~48px) for touch-target comfort on a mobile-first booking flow — don't shrink them back without reason.
- Base UI's `<Select>` requires an `items` prop (value→label map) or `<SelectValue>` renders the raw value instead of the matching `<SelectItem>`'s label — always pass `items={selectItems([...])}` (see `src/lib/utils.ts`). This bit us once already; it's easy to forget since Radix-based shadcn docs don't need it.
- Date pickers use the shared `<DatePicker>` (`src/components/ui/date-picker.tsx`), not a raw `<input type="date">` — four pages already do this (`Home`, `SearchResults`, `RestaurantDetail`, `ManageBooking`).

### i18n conventions

- Wrap every page/component in `useTranslation()` and pull strings via `t('namespace.key')`; don't hardcode UI copy.
- Mock demo content (restaurant names/menus/reviews in `src/data/` and `RestaurantDetail.tsx`'s hardcoded `menuItems`/`reviews`) is intentionally **not** translated — it's placeholder data a real backend will replace, not app chrome.
- Validation error state stores i18n key suffixes (e.g. `'emailInvalid'`), not display text — see `validateContactDetails` in `src/lib/validation.ts` and how `Checkout.tsx` maps them via `t(\`checkout.errors.${code}\`)`. Keep new validators consistent with this pattern rather than returning literal strings.
- `<LanguageSwitcher />` (in `Nav`) is a `Select` over `SUPPORTED_LANGUAGES` from `src/i18n.ts`; language choice persists via `i18next-browser-languagedetector`'s `localStorage` cache.

### Routing and data-flow conventions

- Routes are centralized in `src/lib/constants.ts` (`ROUTES`) — build links/navigations from there, never hardcode a path string.
- Non-sensitive reservation params (`restaurantId`, `date`, `time`, `partySize`) travel as URL query params (`RestaurantDetail` → `Checkout`) so that step is bookmarkable.
- Guest PII collected at checkout (`name`, `email`) travels via `navigate(path, { state })`, never in the URL — `Confirmation` and `ManageBooking` read `useLocation().state` and redirect home/to-bookings if it's missing (no rendering a page from a spoofed or stale URL).
- Any page that looks up an entity by ID/ref (`RestaurantDetail`, `Checkout`, `Confirmation`, `ManageBooking`) redirects (`<Navigate replace />`) instead of silently falling back to the first record when the lookup misses — don't reintroduce a silent fallback.
- No backend integration yet: `src/data/*` mock arrays are the only "database". `ManageBooking` checks router state first (a booking just created in `Checkout`) and falls back to the mock dataset by ref — that's the seam where a real API fetch will plug in later.

## Dependencies

- Runtime: React 19, React DOM 19, React Router 7 (`react-router-dom`)
- UI: shadcn/ui (style `base-nova`) on `@base-ui/react` (not Radix), `class-variance-authority`, `tailwind-merge`, `lucide-react` icons, `react-day-picker` + `date-fns` (calendar)
- i18n: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin, `tw-animate-css` (shadcn's open/close animation variants)
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt; `shadcn` CLI itself lives in devDependencies (build-time only, not shipped)

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

The `@theme` block in `src/index.css` defines the full color palette as named tokens (`--color-terra`, `--color-ink`, `--color-border`, ...). Tailwind v4 auto-generates `bg-*`/`text-*`/`border-*` (with opacity-modifier support, e.g. `bg-terra/20`) for every token — use those class names in JSX rather than arbitrary `bg-[#C4533A]` hex values, so the palette stays defined in one place.

## Mobile-first / responsive

Design mobile-first (base classes = mobile, `sm:`/`lg:` add desktop layout) — this is a booking flow most users complete on a phone. One gotcha already fixed once: `RestaurantDetail` renders a `fixed bottom-0` reservation bar below `lg`, which would otherwise overlap the site `<Footer>` once scrolled that far. `App.tsx` detects that route and passes `<Footer mobileStickyBarOffset>` to reserve matching bottom padding — if another page adds its own fixed bottom bar, extend that same mechanism rather than hardcoding padding in `Footer` itself.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
- Import from other top-level `src/` folders using the `@/` alias (e.g. `@/lib/constants`, `@/components/ui/Button`) rather than relative `../../` paths.
