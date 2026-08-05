/**
 * Raw wire shapes returned by the Backend (`Backend/FLUTTER_GUIDE.md`). These
 * mirror the JSON field names (snake_case) as-is; page-facing types in
 * `src/types/*` stay camelCase-ish and UI-shaped — mapping between the two
 * happens in `src/data/*` and `src/hooks/api/*`.
 */

export interface ApiUser {
  user_id: string
  email: string
  full_name: string
  role: string
  picture?: string | null
  actor_sheet_id?: string | null
  auth_provider?: string
  status?: string
}

export interface ApiRestaurant {
  restaurant_id: string
  category_id?: string
  name: string
  description?: string
  logo?: string
  banner?: string
  status: string
  // `locations` / `cuisines` / `hours` are structured objects on the wire
  // (see Backend/ADMIN_API.md §5) — not modeled here since nothing in this
  // app reads them yet; parse directly off the raw response if/when needed.
}

export interface ApiCatalogItem {
  item_id: string
  restaurant_id: string
  item_type: 'service' | 'product'
  name: string
  description?: string
  price_from: number
  icon?: string
  color?: string
  image?: string
  category_id?: string
  active: boolean
  sort_order: number
}

export interface ApiCategory {
  category_id: string
  name: string
  icon?: string
  active: boolean
  sort_order: number
}

export interface ApiService {
  service_id: string
  name: string
  description?: string
  price_from: number
  icon: string
  color: string
  category_id: string
}

export type ApiReservationStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'

export interface ApiReservation {
  reservation_id: string
  guest_name: string
  party_size: number
  service_id?: string
  service_name?: string
  item_id?: string
  restaurant_id?: string
  start_date: string
  end_date: string
  // Only present on reservations created via the new restaurant_id-only mode.
  // TODO: confirm against actual backend response once merged — this field
  // isn't in the documented `reservation` response shape yet (FLUTTER_GUIDE.md
  // §5), only in the request body for the new creation mode.
  reservation_time?: string
  daily_rate: number
  notes?: string
  status: ApiReservationStatus
  nights: number
  total: number
}

/** Body for the new restaurant_id-only reservation creation mode (see Web/TODO.md). */
export interface CreateReservationBody {
  restaurant_id: string
  guest_name: string
  party_size: number
  start_date: string
  reservation_time: string
  notes?: string
}
