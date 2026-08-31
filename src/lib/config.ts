import { parse } from 'yaml'
import { z } from 'zod'

export const ServiceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  icon: z.string().optional(),
  categoryName: z.string().optional(),
  categoryColor: z.string().optional()
})
export type Service = z.infer<typeof ServiceSchema>

export const BreakpointSchema = z.enum(['lg', 'md', 'sm', 'xs', 'xxs'])

/** Where a category sits on the outer grid, at one breakpoint. */
export const PlacementSchema = z.object({
  x: z.number().int().min(0).optional(),
  y: z.number().int().min(0).optional(),
  w: z.number().int().min(1).optional(),
  rows: z.number().int().min(1).optional()
})
export type Placement = z.infer<typeof PlacementSchema>

export const CategorySchema = z.object({
  name: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
  /** Width in tile columns. */
  w: z.number().int().min(1).optional(),
  /** Visible tile rows; anything beyond this scrolls inside the category. */
  rows: z.number().int().min(1).optional(),
  /** Per-breakpoint overrides for the above, plus an explicit position. */
  layout: z.partialRecord(BreakpointSchema, PlacementSchema).optional(),
  services: z.array(ServiceSchema)
})
export type Category = z.infer<typeof CategorySchema>

/**
 * A saved category placement. Height is stored as a count of tile rows rather
 * than a pixel height, so a layout saved on one screen restores correctly on
 * another.
 */
export const CategoryPlacementSchema = z.object({
  i: z.string(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1),
  rows: z.number().int().min(1)
})
export type CategoryPlacement = z.infer<typeof CategoryPlacementSchema>

/** A saved tile placement, in cells, relative to its category. */
export const TilePlacementSchema = z.object({
  i: z.string(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1),
  h: z.number().int().min(1)
})
export type TilePlacement = z.infer<typeof TilePlacementSchema>

export const DashboardLayoutSchema = z.object({
  categories: z.partialRecord(BreakpointSchema, z.array(CategoryPlacementSchema)).optional(),
  /** Keyed by category name, then by breakpoint. */
  tiles: z.record(
    z.string(),
    z.partialRecord(BreakpointSchema, z.array(TilePlacementSchema))
  ).optional()
})
export type DashboardLayout = z.infer<typeof DashboardLayoutSchema>

export const ConfigSchema = z.object({
  title: z.string().optional(),
  titleSize: z.string().optional(),
  font: z.string().optional(),
  favicon: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  search: z.boolean().optional().default(true),
  searchPrompt: z.string().optional(),
  gridLayout: DashboardLayoutSchema.optional(),
  categories: z.array(CategorySchema).optional()
})
export type Config = z.infer<typeof ConfigSchema>

export const parseConfig = (yamlString: string): Config => {
  const parsed = parse(yamlString)
  return ConfigSchema.parse(parsed)
}

export const loadConfig = async (): Promise<Config> => {
  const res = await fetch('/config.yaml')
  if (!res.ok) throw new Error('Failed to load config.yaml')
  const text = await res.text()
  const config = parseConfig(text)
  
  if (config.title) {
    document.title = config.title
  }
  if (config.favicon) {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = config.favicon
  }
  
  return config
}
