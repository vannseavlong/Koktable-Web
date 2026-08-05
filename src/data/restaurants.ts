import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import type { ApiRestaurant } from '@/types/api'
import type { Cuisine, Neighborhood, Restaurant } from '@/types/restaurant'

// This module is the seam AGENTS.md calls out: pages keep calling
// `useRestaurants()` / `useRestaurantById(id)` (the hook-shaped equivalents of
// the old synchronous `restaurants` array / `findRestaurantById`) and get back
// the same `Restaurant` shape UI components already render.
//
// `GET /user/restaurants` (Backend/FLUTTER_GUIDE.md §3) only returns
// restaurant_id/name/description/logo/banner/status/category_id today — no
// rating, hours, amenities, per-slot availability, address/phone, or
// neighborhood. Those fields stay mock "flavor" data (identical to the old
// hardcoded array) cycled by index over real restaurants so the browsing UI
// keeps rendering unchanged; only `id`/`name`/`description` are real.
// TODO: confirm against actual backend response once merged — drop this
// enrichment layer once `/user/restaurants` grows these fields for real.
const ENRICHMENT: Omit<Restaurant, 'id' | 'name' | 'description'>[] = [
  {
    cuisine: ['Khmer', 'Fine Dining'],
    neighborhood: 'BKK1',
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
    neighborhood: 'BKK1',
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
    neighborhood: 'Bassac Lane',
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
    neighborhood: 'Riverside',
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
    neighborhood: 'Riverside',
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
    neighborhood: 'Toul Tompong',
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

// Filter-facet reference lists (neighborhood/cuisine pickers on Home/SearchResults).
// Not part of the Web/TODO.md checklist — the Backend has no "neighborhood"
// concept and `/user/cuisines` doesn't map 1:1 onto this display list — so
// these stay local for now.
export const neighborhoods: Neighborhood[] = [
  { name: 'BKK1', imageId: 'photo-1596422846543-75c6fc197f07', description: 'Upscale dining hub with international restaurants' },
  { name: 'Riverside', imageId: 'photo-1533929736458-ca588d08c8be', description: 'Scenic waterfront with local and international fare' },
  { name: 'Toul Tompong', imageId: 'photo-1544025162-d76538891a99', description: 'Neighborhood gems and local favorites' },
  { name: 'Bassac Lane', imageId: 'photo-1414235077428-338989a2e8c0', description: 'Trendy laneway bars and contemporary kitchens' },
]

export const cuisines: Cuisine[] = [
  { name: 'Khmer', emoji: '🍲' },
  { name: 'Chinese', emoji: '🥢' },
  { name: 'Thai', emoji: '🌿' },
  { name: 'Vietnamese', emoji: '🍜' },
  { name: 'Japanese', emoji: '🍣' },
  { name: 'Korean', emoji: '🥩' },
  { name: 'Indian', emoji: '🍛' },
  { name: 'Italian', emoji: '🍝' },
  { name: 'French', emoji: '🥐' },
  { name: 'Seafood', emoji: '🦞' },
]

function hashIndex(id: string, length: number): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return hash % length
}

function toRestaurant(api: ApiRestaurant, index: number): Restaurant {
  const enrichment = ENRICHMENT[index % ENRICHMENT.length]
  return {
    ...enrichment,
    id: api.restaurant_id,
    name: api.name,
    description: api.description || `${api.name} — a Phnom Penh favorite.`,
  }
}

// These change rarely — a long staleTime means Home → Detail → back doesn't refire the request.
const RESTAURANTS_STALE_TIME = 5 * 60 * 1000

export function useRestaurants() {
  return useQuery({
    queryKey: queryKeys.restaurants(),
    queryFn: async () => {
      const { restaurants } = await apiFetch<{ restaurants: ApiRestaurant[] }>('/user/restaurants')
      return restaurants.map(toRestaurant)
    },
    staleTime: RESTAURANTS_STALE_TIME,
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
