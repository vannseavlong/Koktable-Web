import type { Booking } from '@/types/booking'

export const upcomingBookings: Booking[] = [
  { ref: 'PP-4X9K2', restaurantId: '1', date: '2024-11-15', time: '7:00 PM', partySize: 2, status: 'confirmed' },
  { ref: 'PP-7M3R1', restaurantId: '2', date: '2024-11-22', time: '8:00 PM', partySize: 4, status: 'pending' },
]

export const pastBookings: Booking[] = [
  { ref: 'PP-2K8P4', restaurantId: '3', date: '2024-10-28', time: '7:30 PM', partySize: 3, status: 'confirmed', hasReview: false },
  { ref: 'PP-9J1N6', restaurantId: '5', date: '2024-10-12', time: '6:30 PM', partySize: 2, status: 'confirmed', hasReview: true },
  { ref: 'PP-5R2T8', restaurantId: '4', date: '2024-09-30', time: '7:00 PM', partySize: 6, status: 'cancelled', hasReview: false },
]

export function findBookingByRef(ref: string | undefined): Booking | undefined {
  if (!ref) return undefined
  return [...upcomingBookings, ...pastBookings].find((b) => b.ref === ref)
}
