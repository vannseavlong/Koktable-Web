import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { Clock01Icon } from "@hugeicons/core-free-icons"

/** Hugeicons "Clock" glyph — used in place of the 🕖 emoji. */
export default function ClockIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={Clock01Icon} {...props} />
}
