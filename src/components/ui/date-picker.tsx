import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatDate, fromISODateString, toISODateString } from '@/lib/format'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disablePast?: boolean
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date', className, disablePast = true }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = fromISODateString(value)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn('justify-start gap-2 font-normal text-ink', !value && 'text-ink-faint', className)}
          >
            <CalendarIcon className="size-4 shrink-0" />
            {value ? formatDate(value, 'compact') : placeholder}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) onChange(toISODateString(date))
            setOpen(false)
          }}
          disabled={disablePast ? { before: today } : undefined}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
