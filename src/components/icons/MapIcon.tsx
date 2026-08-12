import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { MapsIcon } from "@hugeicons/core-free-icons"

/** Hugeicons "Map" glyph — used in place of the 🗺️ emoji. */
export default function MapIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={MapsIcon} {...props} />
}
