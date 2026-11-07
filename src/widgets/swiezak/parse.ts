import { z } from "zod"

export const SwiezakImageSchema = z.object({
  image: z.string(),
  pinned: z.boolean(),
  status: z.string(),
  major: z.array(z.string()).default([]),
  minor: z.array(z.string()).default([]),
  patch: z.array(z.string()).default([]),
  error: z.string().optional(),
  checkedAt: z.string().optional(),
})
export type SwiezakImage = z.infer<typeof SwiezakImageSchema>

export const SwiezakResponseSchema = z.array(SwiezakImageSchema)

export type UpdateLevel = "major" | "minor" | "patch"

export interface SwiezakRow {
  key: string
  name: string
  version: string
  status: string
  error?: string
  update?: { level: UpdateLevel; version: string }
}

const UPDATE_LEVELS: UpdateLevel[] = ["major", "minor", "patch"]

export const parseImageRef = (image: string) => {
  if (image.startsWith("sha256:")) {
    return { name: image.slice(7, 19), version: "untagged" }
  }
  const [ref, digest] = image.split("@")
  const colon = ref.lastIndexOf(":")
  const hasTag = colon > ref.lastIndexOf("/")
  const name = (hasTag ? ref.slice(0, colon) : ref).replace(
    /^docker\.io\/(library\/)?/,
    ""
  )
  const tag = hasTag ? ref.slice(colon + 1) : undefined
  const shortDigest = digest?.replace(/^sha256:/, "").slice(0, 7)
  return { name, version: tag ?? (shortDigest ? `@${shortDigest}` : "latest") }
}

const rank = (row: SwiezakRow) => {
  if (row.update) return UPDATE_LEVELS.indexOf(row.update.level)
  if (row.status === "error") return 3
  if (row.status === "rebuild") return 4
  if (row.status === "up-to-date") return 6
  return 5
}

export const toRows = (images: SwiezakImage[]): SwiezakRow[] =>
  images
    .map((image, index) => {
      const level = UPDATE_LEVELS.find((l) => image[l].length > 0)
      return {
        key: `${index}:${image.image}`,
        ...parseImageRef(image.image),
        status: image.status,
        error: image.error,
        update: level && { level, version: image[level][0] },
      }
    })
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))

export const lastCheckedAt = (images: SwiezakImage[]) =>
  images
    .map((image) => image.checkedAt)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1)
