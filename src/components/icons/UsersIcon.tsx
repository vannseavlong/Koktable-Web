import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react"
import { UserGroupIcon } from "@hugeicons/core-free-icons"

/** Hugeicons "User group" glyph — used in place of the 👥 emoji. */
export default function UsersIcon(props: Omit<HugeiconsProps, "icon">) {
  return <HugeiconsIcon icon={UserGroupIcon} {...props} />
}
