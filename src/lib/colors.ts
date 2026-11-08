/*
 * Every class string is spelled out in full rather than built from the colour
 * name: Tailwind extracts classes by scanning source text, so an interpolated
 * `bg-${name}-500/10` would never make it into the stylesheet.
 */

const PILL_COLORS: Record<string, string> = {
  red: "bg-[color-mix(in_oklab,var(--color-red-500)_16%,var(--background))] text-red-700 dark:text-red-300",
  blue: "bg-[color-mix(in_oklab,var(--color-blue-500)_16%,var(--background))] text-blue-700 dark:text-blue-300",
  green:
    "bg-[color-mix(in_oklab,var(--color-green-500)_16%,var(--background))] text-green-700 dark:text-green-300",
  orange:
    "bg-[color-mix(in_oklab,var(--color-orange-500)_16%,var(--background))] text-orange-700 dark:text-orange-300",
  purple:
    "bg-[color-mix(in_oklab,var(--color-purple-500)_16%,var(--background))] text-purple-700 dark:text-purple-300",
  primary:
    "bg-[color-mix(in_oklab,var(--primary)_16%,var(--background))] text-primary",
  yellow:
    "bg-[color-mix(in_oklab,var(--color-yellow-500)_16%,var(--background))] text-yellow-700 dark:text-yellow-300",
  pink: "bg-[color-mix(in_oklab,var(--color-pink-500)_16%,var(--background))] text-pink-700 dark:text-pink-300",
  cyan: "bg-[color-mix(in_oklab,var(--color-cyan-500)_16%,var(--background))] text-cyan-700 dark:text-cyan-300",
  teal: "bg-[color-mix(in_oklab,var(--color-teal-500)_16%,var(--background))] text-teal-700 dark:text-teal-300",
  indigo:
    "bg-[color-mix(in_oklab,var(--color-indigo-500)_16%,var(--background))] text-indigo-700 dark:text-indigo-300",
  rose: "bg-[color-mix(in_oklab,var(--color-rose-500)_16%,var(--background))] text-rose-700 dark:text-rose-300",
  gray: "bg-[color-mix(in_oklab,var(--color-gray-500)_16%,var(--background))] text-gray-700 dark:text-gray-300",
}

export const getPillColorClasses = (colorName?: string) =>
  (colorName && PILL_COLORS[colorName.toLowerCase()]) ||
  "bg-muted text-muted-foreground"

const CARD_COLORS: Record<string, string> = {
  red: "bg-[color-mix(in_oklab,var(--color-red-500)_7%,var(--panel))] border-red-500/20",
  blue: "bg-[color-mix(in_oklab,var(--color-blue-500)_7%,var(--panel))] border-blue-500/20",
  green:
    "bg-[color-mix(in_oklab,var(--color-green-500)_7%,var(--panel))] border-green-500/20",
  orange:
    "bg-[color-mix(in_oklab,var(--color-orange-500)_7%,var(--panel))] border-orange-500/20",
  purple:
    "bg-[color-mix(in_oklab,var(--color-purple-500)_7%,var(--panel))] border-purple-500/20",
  primary:
    "bg-[color-mix(in_oklab,var(--primary)_7%,var(--panel))] border-primary/20",
  yellow:
    "bg-[color-mix(in_oklab,var(--color-yellow-500)_7%,var(--panel))] border-yellow-500/20",
  pink: "bg-[color-mix(in_oklab,var(--color-pink-500)_7%,var(--panel))] border-pink-500/20",
  cyan: "bg-[color-mix(in_oklab,var(--color-cyan-500)_7%,var(--panel))] border-cyan-500/20",
  teal: "bg-[color-mix(in_oklab,var(--color-teal-500)_7%,var(--panel))] border-teal-500/20",
  indigo:
    "bg-[color-mix(in_oklab,var(--color-indigo-500)_7%,var(--panel))] border-indigo-500/20",
  rose: "bg-[color-mix(in_oklab,var(--color-rose-500)_7%,var(--panel))] border-rose-500/20",
  gray: "bg-[color-mix(in_oklab,var(--color-gray-500)_7%,var(--panel))] border-gray-500/20",
}

export const getCardColorClasses = (colorName?: string) =>
  (colorName && CARD_COLORS[colorName.toLowerCase()]) ||
  "bg-[var(--panel)] border-foreground/[0.07]"

const hueOf = (text: string) =>
  [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7) %
  360

export const getFallbackGradient = (name: string) => {
  const hue = hueOf(name)
  return `linear-gradient(135deg, oklch(0.68 0.15 ${hue}), oklch(0.5 0.17 ${(hue + 40) % 360}))`
}
