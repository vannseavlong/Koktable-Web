export interface Restaurant {
  id: string
  name: string
  cuisine: string[]
  neighborhood: string
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

export interface Neighborhood {
  name: string
  imageId: string
  description: string
}

export interface Cuisine {
  name: string
  emoji: string
}
