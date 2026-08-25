import { parse } from 'yaml'
import { z } from 'zod'

export const ServiceSchema = z.object({
  name: z.string(),
  url: z.string(),
  icon: z.string().optional(),
  description: z.string().optional()
})
export type Service = z.infer<typeof ServiceSchema>

export const CategorySchema = z.object({
  name: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
  services: z.array(ServiceSchema)
})
export type Category = z.infer<typeof CategorySchema>

export const LayoutSchema = z.object({
  columns: z.number().optional()
})
export type Layout = z.infer<typeof LayoutSchema>

export const ConfigSchema = z.object({
  title: z.string().optional(),
  favicon: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  search: z.boolean().optional(),
  layout: LayoutSchema.optional(),
  categories: z.array(CategorySchema).optional()
})
export type Config = z.infer<typeof ConfigSchema>

export const parseConfig = (yamlString: string): Config => {
  const parsed = parse(yamlString)
  return ConfigSchema.parse(parsed)
}

export const loadConfig = async (): Promise<{ config: Config | null; error: string | null }> => {
  try {
    const res = await fetch('/config.yaml')
    if (!res.ok) throw new Error('Failed to load config.yaml')
    const text = await res.text()
    const config = parseConfig(text)
    
    // Side effects
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
    
    return { config, error: null }
  } catch (e: any) {
    return { config: null, error: e.message }
  }
}
