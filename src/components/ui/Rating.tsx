interface RatingProps {
  value: number
  reviewCount?: number
  size?: 'sm' | 'md'
}

export default function Rating({ value, reviewCount, size = 'sm' }: RatingProps) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <span className={`inline-flex items-center gap-1 ${textSize}`}>
      <span className="text-yellow-500">★</span>
      <span className="font-semibold text-ink">{value}</span>
      {reviewCount !== undefined && <span className="text-ink-faint">({reviewCount})</span>}
    </span>
  )
}
