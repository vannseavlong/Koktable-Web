interface ChipProps {
  label: string
  selected: boolean
  onClick: () => void
  icon?: string
  tone?: 'default' | 'highlight'
}

const TONE_CLASSES: Record<'default' | 'highlight', { selected: string; idle: string }> = {
  default: {
    selected: 'bg-terra text-white border-terra',
    idle: 'bg-cream text-ink-muted border-border hover:border-terra hover:text-terra',
  },
  highlight: {
    selected: 'bg-terra text-white border-terra',
    idle: 'bg-terra-light text-terra border-terra-light hover:bg-terra hover:text-white',
  },
}

export default function Chip({ label, selected, onClick, icon, tone = 'default' }: ChipProps) {
  const toneClasses = TONE_CLASSES[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        selected ? toneClasses.selected : toneClasses.idle
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  )
}
