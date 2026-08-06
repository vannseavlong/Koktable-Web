import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { RestaurantIcon as HugeRestaurantIcon } from "@hugeicons/core-free-icons"

/** Hugeicons "Restaurant" glyph — used in place of the 🍽️ emoji for empty/placeholder states. */
export default function RestaurantIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={HugeRestaurantIcon} {...props} />
}
