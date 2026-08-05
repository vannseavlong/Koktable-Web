# TODO — User auth + reservation API integration

Plan for wiring `Web` up to the `Backend` API: guest browsing stays open, login is
required only at the point of confirming a reservation (and for anything
reservation-scoped after that). Written 2026-08-05 after a full review of the
current mock-data Web flow and the live Backend contract.

## Review findings

**Web flow today** is fully client-side mock (`src/data/restaurants.ts`,
`src/data/bookings.ts`) — no network calls anywhere. Path: `Home`/`SearchResults`
(browse, filter) → `RestaurantDetail` (pick date/time/party → `Checkout` via URL
params) → `Checkout` (contact form; has an inert "sign in to autofill" stub) →
`Confirmation` (router-state handoff; has an inert "create account" stub) →
`MyBookings`/`ManageBooking` (mock data, **no auth check at all** — anyone can open
`/bookings` today). `Login.tsx` exists but `handleSubmit` just navigates to
`/bookings` without calling anything. There is no `src/lib/api.ts`, no auth
context, no HTTP client, no token storage yet — clean slate for that layer.

**Backend contract** (`Backend/FLUTTER_GUIDE.md`, `ER-DIAGRAM.md`,
`middleware/auth.ts`) already matches the desired guest/login split almost
exactly:
- Public, no auth: `restaurants`, `catalog-items`, `categories`, `services`
  (browsing).
- Bearer-required: `auth/me`, `profile`, all of `reservations`
  (create/list/active/get/patch).
- Auth is a hand-rolled HMAC-JWT (`Authorization: Bearer <token>`), issued by
  `/user/auth/register`, `/login`, or Google OAuth redirect. No `exp`
  enforcement yet (known gap, see `Backend/CLAUDE.md`).

**Key mismatch — resolved**: the Web UI's booking model is
`restaurant_id + date + time + party_size`. The Backend's `reservations` schema
(`schemas/user/reservations.ts`) is stay-based: `start_date`/`end_date`/
`daily_rate` + exactly one of `service_id`/`item_id` — no `time` field, and
`restaurant_id` is only populated when booking via `item_id`. There's also no
per-time-slot availability concept server-side (Web's `availableTimes` is
currently a hardcoded mock array per restaurant).

**Decision: extend the schema.** Add an optional `reservation_time` column plus
a new restaurant_id-only creation path that doesn't require `service_id`/
`item_id`, defaulting `end_date = start_date` and `daily_rate = 0` for this
booking type. Backward-compatible with the existing stay/service-catalog flow
(additive only — no existing behavior changes).

Note: `Backend/FLUTTER_GUIDE.md` is legacy documentation from an old project —
there is no Flutter app being built anymore. It is not a compatibility target
and does not need to be kept in sync with this work.

## Auth boundary

Derived from the Backend contract, not a new invention:
- **Guest, no token, always**: Home, SearchResults, RestaurantDetail (browse +
  pick date/time/party), restaurants/catalog/categories/services reads.
- **Login required**: the moment of confirming a reservation (`Checkout`'s
  "Confirm Reservation" action), and — necessarily, since `/user/reservations*`
  is Bearer-gated end to end — viewing/managing bookings (`MyBookings`,
  `ManageBooking`), and `Profile`.
- Practically: `RestaurantDetail` and `Checkout`'s form fields stay open to
  guests so the flow feels uninterrupted; the auth gate sits at the "Confirm
  Reservation" click — if no token, prompt inline login/register (reuse the
  existing but currently-inert stub in `Checkout.tsx`) or redirect to
  `/login?next=/checkout?...`, then resume the same draft. `MyBookings` /
  `ManageBooking` / `/bookings/:ref` redirect to `/login` outright if there's
  no token, same pattern `App.tsx` already uses for missing router state.

## Backend work

- [ ] `schemas/user/reservations.ts`: add `reservation_time: string()`
      (optional); relax `end_date`/`daily_rate` requiredness for the new path.
- [ ] `reservations.service.ts` / `validateReservationBody`: accept a third
      creation mode — `restaurant_id` alone (no `service_id`/`item_id`) —
      validate the restaurant exists and is `active`, default
      `end_date = start_date`, `daily_rate = 0`, store `reservation_time`. Keep
      the existing two modes untouched.
- [ ] `reservations.routes.ts` / controller: no route changes needed — same
      `POST /user/reservations`, just a wider accepted body shape.
- [x] ~~Update `FLUTTER_GUIDE.md` § 5~~ — skipped. No Flutter app is being
      built anymore; that doc is legacy from an old project and isn't a
      compatibility target.
- [ ] Re-run `lsdb erdiagram` to refresh `ER-DIAGRAM.md`.
- [ ] No change needed to what's public vs Bearer — that boundary already
      matches what's wanted.

## Web work

- [ ] **API layer**: `src/lib/api.ts` — thin fetch wrapper reading base URL
      from env, attaching `Authorization: Bearer` when a token exists,
      normalizing the `{ error, details? }` shape into thrown errors.
- [ ] **Auth**: `src/lib/auth.ts` / a small context — token + user in memory,
      persisted to `localStorage`, `login`/`register`/`logout`, wired into the
      real `Login.tsx` (currently a no-op navigate).
- [ ] **Data fetching with caching — no unnecessary auto calls**: bring in
      `@tanstack/react-query` (matches the Portal's stack per the top-level
      `CLAUDE.md`, keeps Web/Portal consistent):
  - [ ] `restaurants`, `restaurants/:id`, `catalog-items`, `categories`
        queries get a `staleTime` (these change rarely) so navigating
        Home → Detail → back doesn't refire.
  - [ ] `auth/me` fetched once on app load only if a token exists in storage —
        not on every route change.
  - [ ] `reservations` (MyBookings) fetched only when that route actually
        mounts, not eagerly from Nav.
  - [ ] No polling anywhere; mutations (`create`/`cancel`) invalidate just the
        affected query, not a global refetch.
- [ ] **Route guards**: `MyBookings`, `ManageBooking` redirect to `/login`
      (with a `next` param) when unauthenticated — same `<Navigate replace>`
      pattern already used for missing state.
- [ ] **Checkout**: wire the real create-reservation call behind the "Confirm
      Reservation" button; if unauthenticated, surface the inline auth panel
      (already scaffolded) or bounce to `/login?next=...`, then replay the
      draft from URL params on return.
- [ ] Swap `src/data/restaurants.ts` / `bookings.ts` mock lookups for the real
      queries, keeping the same `findRestaurantById`/`findBookingByRef`-shaped
      call sites the codebase already isolates for exactly this swap (per
      `AGENTS.md`).

## Sequencing

Backend schema/service change → Web API+auth layer → Web page wiring, since
Web's Checkout call shape depends on the final `reservation_time`/
restaurant-only body. Backend first; Web integration depends on the exact
request/response shape it produces.
