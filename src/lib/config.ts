import { useEffect, useState } from 'react'
import { parse } from 'yaml'

export interface Service {
  name: string
  url: string
  icon?: string
  description?: string
}

export interface Category {
  name: string
  color?: string
  icon?: string
  services: Service[]
}

export interface Layout {
  columns?: number
}

export interface Config {
  title?: string
  favicon?: string
  theme?: 'light' | 'dark' | 'auto'
  search?: boolean
  layout?: Layout
  categories?: Category[]
}

export const useConfig = () => {
  const [config, setConfig] = useState<Config | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/config.yaml')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load config.yaml')
        return res.text()
      })
      .then(text => {
        try {
          const parsed = parse(text)
          setConfig(parsed)
        } catch (err: any) {
          setError(`YAML Parse Error: ${err.message}`)
        }
      })
      .catch(err => {
        setError(err.message)
      })
  }, [])

  useEffect(() => {
    if (config?.title) {
      document.title = config.title
    }
    if (config?.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = config.favicon
    }
  }, [config])

  return { config, error }
}
