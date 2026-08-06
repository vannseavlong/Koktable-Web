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

// One entry of `ApiRestaurant.locations` (see Backend/ADMIN_API.md §5). Only the
// fields this app actually reads are modeled — contact_email/rating/price_level/
// images/google_place_id etc. also exist on the wire, parse them directly off the
// raw response if/when needed.
export interface ApiLocation {
  location_id: string
  address?: string
  city?: string
  // Sublocality/neighborhood (e.g. "BKK1") — a directory-import field, blank
  // until backfilled (Backend/scripts/backfill-district.ts). Narrower than `city`.
  district?: string
  latitude?: number
  longitude?: number
  active?: boolean
}

export interface ApiRestaurant {
  restaurant_id: string
  category_id?: string
  name: string
  description?: string
  logo?: string
  banner?: string
  status: string
  // A restaurant can have more than one location (chain/branches); this app only
  // uses the first (see toRestaurant() in src/data/restaurants.ts), same
  // "primary location" assumption the merchant-facing API makes server-side.
  locations?: ApiLocation[]
  // `cuisines` / `hours` are also structured objects on the wire — not modeled
  // here since nothing in this app reads them yet; parse directly off the raw
  // response if/when needed.
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

export interface ApiCity {
  city_id: string
  name: string
  name_zh?: string
  name_km?: string
  name_ko?: string
  sort_order: number
}

export interface ApiDistrict {
  district_id: string
  city_id: string
  name: string
  name_zh?: string
  name_km?: string
  name_ko?: string
  sort_order: number
}

export interface ApiCuisine {
  cuisine_id: string
  name: string
  name_zh?: string
  name_km?: string
  name_ko?: string
  icon?: string
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
  // Confirmed live on the wire (reservations.service.ts stores it on the row and
  // withTotals() doesn't strip fields) — blank for the legacy service_id/item_id modes.
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
