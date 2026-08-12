import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { Location03Icon } from "@hugeicons/core-free-icons"

/** Hugeicons "Location pin" glyph — used in place of the 📍 emoji. */
export default function LocationIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={Location03Icon} {...props} />
}
