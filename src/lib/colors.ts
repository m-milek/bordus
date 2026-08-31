/*
 * Every class string is spelled out in full rather than built from the colour
 * name: Tailwind extracts classes by scanning source text, so an interpolated
 * `bg-${name}-500/10` would never make it into the stylesheet.
 */

export const getColorClasses = (colorName?: string) => {
  if (!colorName) return "bg-transparent border-border"

  const colors: Record<string, string> = {
    red: "bg-red-500/10 border-red-500/50",
    blue: "bg-blue-500/10 border-blue-500/50",
    green: "bg-green-500/10 border-green-500/50",
    orange: "bg-orange-500/10 border-orange-500/50",
    purple: "bg-purple-500/10 border-purple-500/50",
    primary: "bg-primary/10 border-primary/50",
    yellow: "bg-yellow-500/10 border-yellow-500/50",
    pink: "bg-pink-500/10 border-pink-500/50",
    cyan: "bg-cyan-500/10 border-cyan-500/50",
    teal: "bg-teal-500/10 border-teal-500/50",
    indigo: "bg-indigo-500/10 border-indigo-500/50",
    rose: "bg-rose-500/10 border-rose-500/50",
    gray: "bg-gray-500/10 border-gray-500/50",
  }

  return colors[colorName.toLowerCase()] || "bg-transparent border-border"
}

/**
 * Tile surface: the card colour nudged a few percent toward the category's.
 *
 * An opaque mix rather than a translucent overlay, so a tile reads as a plain
 * solid sitting *on* the category's tinted panel instead of blending into it.
 * The category card carries the colour; a tile only hints at it.
 */
export const getTileColorClasses = (colorName?: string) => {
  const colors: Record<string, string> = {
    red: "bg-[color-mix(in_oklab,var(--color-red-500)_7%,var(--card))]",
    blue: "bg-[color-mix(in_oklab,var(--color-blue-500)_7%,var(--card))]",
    green: "bg-[color-mix(in_oklab,var(--color-green-500)_7%,var(--card))]",
    orange: "bg-[color-mix(in_oklab,var(--color-orange-500)_7%,var(--card))]",
    purple: "bg-[color-mix(in_oklab,var(--color-purple-500)_7%,var(--card))]",
    primary: "bg-[color-mix(in_oklab,var(--primary)_7%,var(--card))]",
    yellow: "bg-[color-mix(in_oklab,var(--color-yellow-500)_7%,var(--card))]",
    pink: "bg-[color-mix(in_oklab,var(--color-pink-500)_7%,var(--card))]",
    cyan: "bg-[color-mix(in_oklab,var(--color-cyan-500)_7%,var(--card))]",
    teal: "bg-[color-mix(in_oklab,var(--color-teal-500)_7%,var(--card))]",
    indigo: "bg-[color-mix(in_oklab,var(--color-indigo-500)_7%,var(--card))]",
    rose: "bg-[color-mix(in_oklab,var(--color-rose-500)_7%,var(--card))]",
    gray: "bg-[color-mix(in_oklab,var(--color-gray-500)_7%,var(--card))]",
  }

  return (colorName && colors[colorName.toLowerCase()]) || "bg-card"
}

export const getSolidColorClasses = (colorName?: string) => {
  if (!colorName) return "bg-muted text-muted-foreground"

  const colors: Record<string, string> = {
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    orange: "bg-orange-500 text-white",
    purple: "bg-purple-500 text-white",
    primary: "bg-primary text-primary-foreground",
    yellow: "bg-yellow-500 text-black",
    pink: "bg-pink-500 text-white",
    cyan: "bg-cyan-500 text-black",
    teal: "bg-teal-500 text-white",
    indigo: "bg-indigo-500 text-white",
    rose: "bg-rose-500 text-white",
    gray: "bg-gray-500 text-white",
  }

  return colors[colorName.toLowerCase()] || "bg-muted text-muted-foreground"
}
