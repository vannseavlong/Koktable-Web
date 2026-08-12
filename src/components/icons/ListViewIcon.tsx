import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

/** Hugeicons "Menu" glyph — used in place of the ☰ text character (list-view toggle). */
export default function ListViewIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={Menu01Icon} {...props} />
}
