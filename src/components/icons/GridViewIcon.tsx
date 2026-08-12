import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { GridViewIcon as HugeGridViewIcon } from "@hugeicons/core-free-icons"

/** Hugeicons "Grid view" glyph — used in place of the ⊞ text character (map-view toggle). */
export default function GridViewIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={HugeGridViewIcon} {...props} />
}
