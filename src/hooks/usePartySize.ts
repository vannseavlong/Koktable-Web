import { useState } from 'react'
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE } from '@/lib/constants'

export function usePartySize(initial = 2) {
  const [partySize, setPartySize] = useState(initial)
  const increment = () => setPartySize((size) => Math.min(MAX_PARTY_SIZE, size + 1))
  const decrement = () => setPartySize((size) => Math.max(MIN_PARTY_SIZE, size - 1))
  return { partySize, setPartySize, increment, decrement }
}
