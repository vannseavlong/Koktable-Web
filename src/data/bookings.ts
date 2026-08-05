import { useMemo } from 'react'
import { useReservation, useReservations } from '@/hooks/api/useReservations'
import type { ApiReservation } from '@/types/api'
import type { Booking } from '@/types/booking'

// The hook-shaped equivalents of the old `upcomingBookings`/`pastBookings`
// arrays and `findBookingByRef` — see AGENTS.md's note on this file being the
// seam for the real backend. `ref` is now the Backend's `reservation_id`
// (e.g. `rsv_xxx`), not the old mock `PP-XXXXX` code.

const UPCOMING_STATUSES = new Set<ApiReservation['status']>(['pending', 'confirmed', 'active'])

function toBooking(r: ApiReservation): Booking {
  return {
    ref: r.reservation_id,
    // Populated for reservations created via the new restaurant_id-only mode
    // this app uses; blank for the legacy service_id-based mode (see
    // FLUTTER_GUIDE.md §5's note on `restaurant_id`).
    restaurantId: r.restaurant_id ?? '',
    date: r.start_date,
    // TODO: confirm against actual backend response once merged — `reservation_time`
    // isn't in the documented response shape yet, only the new-mode request body.
    time: r.reservation_time ?? '',
    partySize: r.party_size,
    status: r.status,
    hasReview: false, // no review feature on the API yet
  }
}

/** `MyBookings` — fetched only when that route mounts, split into tabs client-side. */
export function useBookings() {
  const query = useReservations()
  const reservations = query.data?.reservations ?? []
  const upcoming = useMemo(() => reservations.filter((r) => UPCOMING_STATUSES.has(r.status)).map(toBooking), [reservations])
  const past = useMemo(() => reservations.filter((r) => !UPCOMING_STATUSES.has(r.status)).map(toBooking), [reservations])
  return { ...query, upcoming, past }
}

/** `ManageBooking` — single reservation by ref (`reservation_id`). */
export function useBookingByRef(ref: string | undefined) {
  const query = useReservation(ref)
  return { ...query, data: query.data ? toBooking(query.data.reservation) : undefined }
}
