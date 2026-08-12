import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"

/** Hugeicons "Calendar" glyph — used in place of the 📅 emoji. */
export default function CalendarIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={Calendar03Icon} {...props} />
}
