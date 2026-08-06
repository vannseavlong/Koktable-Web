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

// Curated marketing card for the Home "browse by city" grid — hand-picked copy, not API data.
export interface CityHighlight {
  name: string
  imageId: string
  description: string
}
