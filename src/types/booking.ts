export type BookingStatus = 'confirmed' | 'pending' | 'cancelled'

export interface Booking {
  ref: string
  restaurantId: string
  date: string
  time: string
  partySize: number
  status: BookingStatus
  hasReview?: boolean
}

/** Draft reservation details carried from a restaurant page into checkout via the URL. */
export interface ReservationDraft {
  restaurantId: string
  date: string
  time: string
  partySize: string
}

/** Guest contact details collected at checkout. */
export interface ContactDetails {
  firstName: string
  lastName: string
  phone: string
  email: string
}

/** Full state handed from Checkout to the Confirmation page after a successful booking. */
export interface ConfirmedBooking extends ReservationDraft {
  bookingRef: string
  name: string
  email: string
}
