import { formatPartySize } from '@/lib/format'

interface PartySizeStepperProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
}

export default function PartySizeStepper({ value, onIncrement, onDecrement }: PartySizeStepperProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-cream">
      <button
        type="button"
        onClick={onDecrement}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-border text-ink hover:bg-terra hover:text-white transition-all font-bold text-sm"
      >
        −
      </button>
      <span className="flex-1 text-center text-sm font-medium text-ink">{formatPartySize(value)}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-border text-ink hover:bg-terra hover:text-white transition-all font-bold text-sm"
      >
        +
      </button>
    </div>
  )
}
