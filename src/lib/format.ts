export function formatPrice(level: 1 | 2 | 3 | 4): string {
  return '$'.repeat(level)
}

export function formatDate(dateStr: string, style: 'long' | 'short' | 'compact' = 'long'): string {
  const date = new Date(`${dateStr}T12:00:00`)
  if (style === 'compact') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (style === 'short') {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/** yyyy-mm-dd using local calendar fields — avoids the UTC-shift bugs of toISOString(). */
export function toISODateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parses a 'yyyy-mm-dd' string as a local-timezone date (not UTC midnight). */
export function fromISODateString(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export function formatPartySize(size: number | string): string {
  const n = Number(size)
  return `${n} ${n === 1 ? 'guest' : 'guests'}`
}

interface UnsplashOptions {
  width: number
  height: number
}

export function unsplashUrl(imageId: string, { width, height }: UnsplashOptions): string {
  return `https://images.unsplash.com/${imageId}?w=${width}&h=${height}&fit=crop&auto=format`
}
