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

export const CategorySchema = z.object({
  name: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
  services: z.array(ServiceSchema)
})
export type Category = z.infer<typeof CategorySchema>

export const ConfigSchema = z.object({
  title: z.string().optional(),
  titleSize: z.string().optional(),
  font: z.string().optional(),
  favicon: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  search: z.boolean().optional().default(true),
  searchPrompt: z.string().optional(),
  gridLayout: z.any().optional(),
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
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      const issues = e.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { config: null, error: `Config validation failed: ${issues}` }
    }
    if (e instanceof Error) {
      return { config: null, error: e.message }
    }
    return { config: null, error: 'An unknown error occurred while parsing the configuration.' }
  }
}
