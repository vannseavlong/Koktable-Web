import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

/** Hugeicons "Tick" glyph — used in place of the ✓ text character. */
export default function CheckIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={Tick02Icon} {...props} />
}
