export const BRAND_NAME = 'KokTable'

export const ROUTES = {
  home: '/',
  restaurants: '/restaurants',
  restaurantDetail: (id: string) => `/restaurants/${id}`,
  checkout: '/checkout',
  confirmation: '/confirmation',
  login: '/login',
  bookings: '/bookings',
  manageBooking: (ref: string) => `/bookings/${ref}`,
} as const

export const MIN_PARTY_SIZE = 1
export const MAX_PARTY_SIZE = 20

export const TIME_SLOT_OPTIONS = [
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
] as const
