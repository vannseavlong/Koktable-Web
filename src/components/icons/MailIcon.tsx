import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { Mail01Icon } from "@hugeicons/core-free-icons"

/** Hugeicons "Mail" glyph — used in place of the 📧 emoji. */
export default function MailIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={Mail01Icon} {...props} />
}
