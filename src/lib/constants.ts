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

/** localStorage key the auth JWT is persisted under; shared by `lib/api.ts` and `lib/auth.tsx`. */
export const AUTH_TOKEN_STORAGE_KEY = 'koktable.auth.token'

/** Default Backend base URL for local dev — overridden by `VITE_API_BASE_URL`. */
export const DEFAULT_API_BASE_URL = 'http://localhost:3000'

export const TIME_SLOT_OPTIONS = [
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
] as const
