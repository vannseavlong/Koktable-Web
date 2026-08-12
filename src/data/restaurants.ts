import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import type { ApiRestaurant } from '@/types/api'
import type { CityHighlight, Restaurant } from '@/types/restaurant'

// This module is the seam AGENTS.md calls out: pages keep calling
// `useRestaurants()` / `useRestaurantById(id)` (the hook-shaped equivalents of
// the old synchronous `restaurants` array / `findRestaurantById`) and get back
// the same `Restaurant` shape UI components already render.
//
// `GET /user/restaurants` (Backend/FLUTTER_GUIDE.md §3) now embeds real
// `locations`/`cuisines`/`hours` — city/district/address/lat/long below come from
// `locations[0]`, and cuisine tags come from `cuisines` (see toRestaurant()).
// Everything else (rating, review count, hours, amenities, phone, per-slot
// availability, hero image) still doesn't have a real source the UI can use
// yet, so it stays mock "flavor" data cycled by index over real restaurants,
// same as before.
// TODO: fold hours from the API response in here too once something
// downstream actually needs it to be real.
const ENRICHMENT: Omit<Restaurant, 'id' | 'name' | 'description' | 'city' | 'district'>[] = [
  {
    cuisine: ['Khmer', 'Fine Dining'],
    priceLevel: 3,
    rating: 4.8,
    reviewCount: 312,
    knownFor: 'Fish amok, lok lak, amok trey',
    imageId: 'photo-1414235077428-338989a2e8c0',
    openNow: true,
    address: '136 Norodom Blvd, BKK1, Phnom Penh',
    phone: '+855 23 221 022',
    hours: {
      Monday: '11:30 AM – 10:00 PM',
      Tuesday: '11:30 AM – 10:00 PM',
      Wednesday: '11:30 AM – 10:00 PM',
      Thursday: '11:30 AM – 10:00 PM',
      Friday: '11:30 AM – 11:00 PM',
      Saturday: '11:30 AM – 11:00 PM',
      Sunday: '11:30 AM – 10:00 PM',
    },
    amenities: ['Outdoor Seating', 'Vegetarian Options', 'Vegan Options', 'Private Dining', 'Bar', 'Accepts Cards'],
    availableTimes: ['6:00 PM', '6:30 PM', '7:00 PM', '8:00 PM', '8:30 PM'],
  },
  {
    cuisine: ['French', 'Fine Dining'],
    priceLevel: 4,
    rating: 4.7,
    reviewCount: 187,
    knownFor: 'Duck confit, foie gras, French wine selection',
    imageId: 'photo-1559339352-11d035aa65de',
    openNow: true,
    address: '182 Norodom Blvd, BKK1, Phnom Penh',
    phone: '+855 23 221 522',
    hours: {
      Monday: 'Closed',
      Tuesday: '6:00 PM – 10:30 PM',
      Wednesday: '6:00 PM – 10:30 PM',
      Thursday: '6:00 PM – 10:30 PM',
      Friday: '12:00 PM – 2:00 PM, 6:00 PM – 10:30 PM',
      Saturday: '12:00 PM – 2:00 PM, 6:00 PM – 10:30 PM',
      Sunday: '12:00 PM – 2:00 PM, 6:00 PM – 10:00 PM',
    },
    amenities: ['Air Conditioning', 'Private Dining', 'Bar', 'Accepts Cards', 'Valet Parking'],
    availableTimes: ['7:00 PM', '7:30 PM', '9:00 PM'],
  },
  {
    cuisine: ['Asian Fusion', 'Contemporary'],
    priceLevel: 2,
    rating: 4.5,
    reviewCount: 429,
    knownFor: 'Sharing plates, natural wine, craft cocktails',
    imageId: 'photo-1555396273-367ea4eb4db5',
    openNow: true,
    address: 'Bassac Lane, off Sothearos Blvd, Tonle Bassac',
    phone: '+855 12 345 678',
    hours: {
      Monday: '5:00 PM – 11:00 PM',
      Tuesday: '5:00 PM – 11:00 PM',
      Wednesday: '5:00 PM – 11:00 PM',
      Thursday: '5:00 PM – 12:00 AM',
      Friday: '5:00 PM – 12:00 AM',
      Saturday: '12:00 PM – 12:00 AM',
      Sunday: '12:00 PM – 11:00 PM',
    },
    amenities: ['Outdoor Seating', 'Bar', 'Vegetarian Options', 'Accepts Cards', 'Cocktails'],
    availableTimes: ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '9:00 PM'],
  },
  {
    cuisine: ['International', 'Khmer'],
    priceLevel: 2,
    rating: 4.3,
    reviewCount: 554,
    knownFor: 'Sunset views, river prawns, mango salad',
    imageId: 'photo-1537047902294-62a40c20a6ae',
    openNow: false,
    address: 'Sisowath Quay, Riverside, Phnom Penh',
    phone: '+855 23 987 654',
    hours: {
      Monday: '10:00 AM – 10:00 PM',
      Tuesday: '10:00 AM – 10:00 PM',
      Wednesday: '10:00 AM – 10:00 PM',
      Thursday: '10:00 AM – 11:00 PM',
      Friday: '10:00 AM – 11:00 PM',
      Saturday: '9:00 AM – 11:00 PM',
      Sunday: '9:00 AM – 10:00 PM',
    },
    amenities: ['Outdoor Seating', 'River View', 'Vegetarian Options', 'Accepts Cards', 'Parking'],
    availableTimes: [],
  },
  {
    cuisine: ['Chinese', 'Cantonese'],
    priceLevel: 3,
    rating: 4.6,
    reviewCount: 263,
    knownFor: 'Peking duck, dim sum, har gow',
    imageId: 'photo-1569050467447-ce54b3bbc37d',
    openNow: true,
    address: '45 Sisowath Quay, Riverside, Phnom Penh',
    phone: '+855 23 223 234',
    hours: {
      Monday: '11:00 AM – 10:00 PM',
      Tuesday: '11:00 AM – 10:00 PM',
      Wednesday: '11:00 AM – 10:00 PM',
      Thursday: '11:00 AM – 10:00 PM',
      Friday: '11:00 AM – 11:00 PM',
      Saturday: '10:00 AM – 11:00 PM',
      Sunday: '10:00 AM – 10:00 PM',
    },
    amenities: ['Private Dining', 'Bar', 'Accepts Cards', 'Air Conditioning'],
    availableTimes: ['7:00 PM', '7:30 PM', '8:00 PM'],
  },
  {
    cuisine: ['Thai', 'Seafood'],
    priceLevel: 2,
    rating: 4.4,
    reviewCount: 198,
    knownFor: 'Whole fried fish, green curry, som tum',
    imageId: 'photo-1611143669185-af224c5e3252',
    openNow: true,
    address: 'Street 450, Toul Tompong, Phnom Penh',
    phone: '+855 77 456 789',
    hours: {
      Monday: '11:00 AM – 10:00 PM',
      Tuesday: '11:00 AM – 10:00 PM',
      Wednesday: '11:00 AM – 10:00 PM',
      Thursday: '11:00 AM – 10:00 PM',
      Friday: '11:00 AM – 11:00 PM',
      Saturday: '11:00 AM – 11:00 PM',
      Sunday: '11:00 AM – 10:00 PM',
    },
    amenities: ['Outdoor Seating', 'Vegetarian Options', 'Accepts Cards'],
    availableTimes: ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:30 PM'],
  },
]

// Home "browse by city" image-grid — curated marketing copy, not the real city vocabulary.
// Filter dropdowns use useCities()/useDistricts() (src/hooks/api/useCatalog.ts) instead.
export const cities: CityHighlight[] = [
  { name: 'Phnom Penh', image: '/phnom_penh.webp', description: 'The capital — riverside dining and the city’s biggest restaurant scene' },
  { name: 'Siem Reap', image: '/siem_reap.webp', description: 'Gateway to Angkor, with a lively old-town dining strip' },
  { name: 'Sihanoukville', image: '/sihanoukville.webp', description: 'Coastal city known for fresh seafood and beachfront kitchens' },
]

function hashIndex(id: string, length: number): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return hash % length
}

function toRestaurant(api: ApiRestaurant, index: number): Restaurant {
  const enrichment = ENRICHMENT[index % ENRICHMENT.length]
  // The merchant-facing "single location" assumption (see restaurantLocations.service.ts's
  // getPrimary()) — a restaurant is created with exactly one location today, so the first
  // is the primary/only one. address/city/district/lat/long are blank until the merchant
  // fills them in (or, for district, until the directory backfill runs) — fall back to the
  // mock address only, since showing a real-but-blank city/district would be worse than
  // just not filtering on it.
  const location = api.locations?.[0]
  return {
    ...enrichment,
    id: api.restaurant_id,
    name: api.name,
    description: api.description || `${api.name} — a local favorite.`,
    city: location?.city ?? '',
    district: location?.district ?? '',
    address: location?.address || enrichment.address,
    cuisine: api.cuisines?.length ? api.cuisines : enrichment.cuisine,
  }
}

export interface RestaurantFilters {
  cityId?: string
  districtId?: string
  cuisineId?: string
}

// These change rarely — a long staleTime means Home → Detail → back doesn't refire the request.
const RESTAURANTS_STALE_TIME = 5 * 60 * 1000

// Shared by useRestaurants and useInfiniteRestaurants below — turns filters into the
// city_id/district_id/cuisine_id query-string fragment `GET /user/restaurants`
// (Backend/WEB_API_GUIDE.md §3) expects. Callers add their own limit/offset on top.
function buildRestaurantsParams(filters: RestaurantFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.cityId) params.set('city_id', filters.cityId)
  if (filters.districtId) params.set('district_id', filters.districtId)
  if (filters.cuisineId) params.set('cuisine_id', filters.cuisineId)
  return params
}

export function useRestaurants(filters: RestaurantFilters = {}) {
  return useQuery({
    queryKey: queryKeys.restaurants(filters),
    queryFn: async () => {
      const query = buildRestaurantsParams(filters).toString()
      const { restaurants } = await apiFetch<{ restaurants: ApiRestaurant[] }>(`/user/restaurants${query ? `?${query}` : ''}`)
      return restaurants.map(toRestaurant)
    },
    staleTime: RESTAURANTS_STALE_TIME,
  })
}

interface RestaurantsPage {
  restaurants: Restaurant[]
  total: number
  limit: number
  offset: number
}

/**
 * Paginated equivalent of useRestaurants, for infinite-scroll result lists
 * (SearchResults). Hits `GET /user/restaurants` with `limit`/`offset`
 * (Backend/WEB_API_GUIDE.md §3) instead of fetching every matching restaurant
 * in one response. Each page is mapped through the same toRestaurant() used
 * by useRestaurants, with the enrichment cycle keyed off each restaurant's
 * position in the overall filtered result set (`offset + i`) so it stays
 * consistent as more pages load, rather than restarting at 0 every page.
 */
export function useInfiniteRestaurants(
  filters: RestaurantFilters = {},
  pageSize = 20,
  options: { enabled?: boolean } = {},
) {
  return useInfiniteQuery({
    queryKey: queryKeys.restaurantsInfinite(filters),
    enabled: options.enabled ?? true,
    queryFn: async ({ pageParam }): Promise<RestaurantsPage> => {
      const params = buildRestaurantsParams(filters)
      params.set('limit', String(pageSize))
      params.set('offset', String(pageParam))
      const { restaurants, total, limit, offset } = await apiFetch<{
        restaurants: ApiRestaurant[]
        total: number
        limit: number
        offset: number
      }>(`/user/restaurants?${params.toString()}`)
      return {
        restaurants: restaurants.map((r, i) => toRestaurant(r, offset + i)),
        total,
        limit,
        offset,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit
      return nextOffset < lastPage.total ? nextOffset : undefined
    },
    staleTime: RESTAURANTS_STALE_TIME,
  })
}

export function useRestaurantsPage(
  filters: RestaurantFilters = {},
  page = 1,
  pageSize = 20,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.restaurantsPage(filters, page, pageSize),
    queryFn: async (): Promise<RestaurantsPage> => {
      const params = buildRestaurantsParams(filters)
      params.set('limit', String(pageSize))
      params.set('offset', String((page - 1) * pageSize))
      const { restaurants, total, limit, offset } = await apiFetch<{
        restaurants: ApiRestaurant[]
        total: number
        limit: number
        offset: number
      }>(`/user/restaurants?${params.toString()}`)
      return {
        restaurants: restaurants.map((r, i) => toRestaurant(r, offset + i)),
        total,
        limit,
        offset,
      }
    },
    enabled: options.enabled ?? true,
    staleTime: RESTAURANTS_STALE_TIME,
    placeholderData: (previousData) => previousData,
  })
}

export function useRestaurantById(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.restaurant(id),
    queryFn: async () => {
      const { restaurant } = await apiFetch<{ restaurant: ApiRestaurant }>(`/user/restaurants/${id}`)
      return toRestaurant(restaurant, hashIndex(restaurant.restaurant_id, ENRICHMENT.length))
    },
    enabled: !!id,
    staleTime: RESTAURANTS_STALE_TIME,
  })
}
