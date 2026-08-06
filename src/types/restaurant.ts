export interface Restaurant {
  id: string
  name: string
  cuisine: string[]
  // City/district come from the restaurant's primary location (real API data —
  // see toRestaurant() in src/data/restaurants.ts). `district` is blank until
  // Backend/scripts/backfill-district.ts has run for that location.
  city: string
  district: string
  priceLevel: 1 | 2 | 3 | 4
  rating: number
  reviewCount: number
  description: string
  knownFor: string
  imageId: string
  openNow: boolean
  address: string
  phone: string
  hours: Record<string, string>
  amenities: string[]
  availableTimes: string[]
}

// Curated marketing card for the Home "browse by city" grid — imageId/description
// are hand-picked copy, not derived from API data. District has no such curated list
// (no per-district imagery/copy exists yet); district options are instead derived at
// render time from whichever restaurants are loaded — see districtsForCity() in
// src/data/restaurants.ts.
export interface CityHighlight {
  name: string
  imageId: string
  description: string
}

export interface Cuisine {
  name: string
  emoji: string
}
