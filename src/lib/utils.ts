import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Builds the value→label map Base UI's <Select items={...}> needs for
 * <SelectValue> to render the selected item's label instead of its raw value.
 */
export function selectItems(labels: string[], placeholder?: [value: string, label: string]): Record<string, string> {
  const entries = labels.map((label) => [label, label] as const)
  return Object.fromEntries(placeholder ? [placeholder, ...entries] : entries)
}
