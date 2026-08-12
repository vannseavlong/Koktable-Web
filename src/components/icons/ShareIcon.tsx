import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { Share08Icon } from "@hugeicons/core-free-icons"

/** Hugeicons "Share" glyph — used in place of the 📤 emoji. */
export default function ShareIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={Share08Icon} {...props} />
}
