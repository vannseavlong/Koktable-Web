import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { PencilEdit02Icon } from "@hugeicons/core-free-icons"

/** Hugeicons "Pencil edit" glyph — used in place of the ✏️ emoji. */
export default function EditIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={PencilEdit02Icon} {...props} />
}
