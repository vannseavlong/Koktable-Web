# Security Checklist — OWASP Top 10:2025 (Web)

Baseline audit of the customer-facing web app (React, talks to `Backend`) against the [OWASP Top 10:2025](https://owasp.org/Top10/2025/0x00_2025-Introduction/).
Client-side apps don't map 1:1 onto a server-focused list — items below are the subset that applies to a SPA, plus what it inherits from `Backend/SECURITY_CHECKLIST.md`. This is the public-facing, highest-traffic client of the three repos, so treat gaps here as higher priority than the equivalent Portal ones.
Checked items are already true of this codebase as of 2026-08-13; unchecked items are gaps to close, worked one at a time.

## A01:2025 — Broken Access Control
- [x] `lib/api.ts` centralizes the `Authorization: Bearer <token>` attach — no ad hoc auth headers scattered across call sites
- [ ] Audit route guards — confirm authenticated-only pages (booking history, profile) actually redirect unauthenticated users rather than rendering-then-failing on the API call
- [ ] Confirm no restaurant/booking IDs are guessable/sequential in a way that matters if access control has a gap server-side (defense in depth — Backend enforcement is the real control)

## A02:2025 — Security Misconfiguration
- [x] `index.html` now has a baseline `Content-Security-Policy` meta tag (`default-src 'self'`, plus `style-src`/`font-src` for Google Fonts, `img-src` for `images.unsplash.com`, `connect-src` for the Backend API). A meta tag can't set `frame-ancestors`, `report-uri`, or HSTS/`X-Content-Type-Options`/`X-Frame-Options` — those need HTTP response headers, which means the hosting/CDN layer; flagged as a deploy-infra follow-up, out of this repo's control.
- [ ] No security headers audit done for the static hosting layer (HSTS, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`) — deploy-infra follow-up, not fixable from this repo
- [ ] Confirm all `VITE_*` env vars are non-secret (bundled into the public client) — includes any Google Maps/Places key if one is used client-side; if so, confirm it's restricted (HTTP referrer + API restrictions in Google Cloud Console), not a raw unrestricted key

## A03:2025 — Software Supply Chain Failures
- [x] Added `.github/workflows/ci.yml` — installs with `--frozen-lockfile`, typechecks (`tsc --noEmit`), runs `pnpm build`, and `pnpm audit --audit-level=high`. No `test` script exists in `package.json` yet, so there's nothing for CI to run there.
- [x] `pnpm audit --audit-level=high` now passes — patched transitive `postcss`/`nanoid` via `pnpm-workspace.yaml` `overrides`, bumped `vite` to 8.2.1 (fixes 3 dev-server-only high CVEs, all within the existing `^8.0.0` range)
- [x] `pnpm-lock.yaml` — confirmed committed; `--frozen-lockfile` succeeds in CI and locally

## A04:2025 — Cryptographic Failures
- [ ] Auth token stored in `localStorage` (`AUTH_TOKEN_STORAGE_KEY`, `lib/auth.tsx`) — readable by any script on the page, so any future XSS is a full session takeover; this is the biggest gap in this repo relative to Portal's cookie-based approach. Skipped here: moving to an `HttpOnly` cookie needs the Backend to set `Set-Cookie` on login/register/OAuth-callback instead of returning a bearer token in the JSON body — an API contract change (`Backend/WEB_API_GUIDE.md`) that has to be designed and shipped together with the Backend, not fixed unilaterally in this repo.
- [ ] Evaluate moving to an `HttpOnly` cookie (requires Backend changes: `Set-Cookie` on login instead of returning a bearer token) or, short of that, tightly scoping what scripts/third-party tags can run (see A02's CSP item) to shrink the XSS blast radius
- [ ] Confirm `pendingCheckout.ts`'s use of storage doesn't also cache anything payment- or PII-sensitive beyond what's already reviewed

## A05:2025 — Injection
- [x] No `dangerouslySetInnerHTML` usage found — React's default escaping isn't being bypassed anywhere
- [ ] `i18next` — confirm interpolated translation strings keep `escapeValue` at its safe default (React already escapes on render, but verify nothing overrides it for a specific namespace)

## A06:2025 — Insecure Design
- [ ] Confirm login/register forms have client-side lockout/backoff UX to match whatever the Backend ends up enforcing (see `Backend/SECURITY_CHECKLIST.md` A06) — currently neither side has it, and this is the app most exposed to credential-stuffing traffic. Skipped: Backend doesn't have the rate-limit primitive yet, so there's nothing for the client to reflect.
- [ ] Checkout/booking flow — confirm price/availability is always re-validated server-side at booking-confirm time, not just trusted from client state carried through `pendingCheckout.ts`

## A07:2025 — Authentication Failures
- [ ] Inherits the Backend's non-expiring-token gap, compounded by `localStorage` storage above — a stolen token from this app works indefinitely and is easier to steal than Portal's cookie
- [ ] No MFA option (lower priority for customer accounts than admin, but note it). Skipped here — out of scope for this pass.
- [x] `loginWithToken` picks up a token handed back on the Google OAuth redirect via `?token=` — confirmed `app/App.tsx`'s redirect-handling effect already strips `token` from the URL via `navigate(..., { replace: true })` right after `loginWithToken`/`persistToken` runs, on both the plain-strip and resume-checkout branches, so it doesn't linger in history

## A08:2025 — Software or Data Integrity Failures
- [ ] Confirm `pnpm build` output is what's actually deployed, with no untracked manual step
- [ ] Any third-party script tags (analytics, maps, payment widgets) — confirm they're loaded with `integrity`/SRI hashes where the vendor supports it

## A09:2025 — Security Logging & Alerting Failures
- [ ] No client-side error/crash reporting (Sentry or similar) — public users hitting broken auth/booking flows currently fail silently from an ops perspective
- [ ] Decide whether this app needs its own logging story or whether Backend-side audit logging (once added) is sufficient

## A10:2025 — Mishandling of Exceptional Conditions
- [x] `ApiError` (from `lib/api.ts`) gives call sites a typed shape to branch on instead of guessing at response shape
- [x] Added `components/ErrorBoundary.tsx`, mounted in `main.tsx` around the whole app (outside `QueryClientProvider`/`BrowserRouter`/`AuthProvider`) — an unexpected render error now shows a safe fallback with a link back home instead of a blank screen
- [ ] Confirm the booking/checkout flow specifically has explicit handling for the "request succeeded server-side but response was lost" case (retry-safe or clearly communicated), since that's the highest-stakes exceptional condition in this app
