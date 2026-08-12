import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { StarIcon as HugeStarIcon } from "@hugeicons/core-free-icons"

/** Hugeicons "Star" glyph — used in place of the ★ text character. */
export default function StarIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={HugeStarIcon} {...props} />
}
