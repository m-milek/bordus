import { useState, useCallback, useMemo } from 'react'
import { Layout, ResponsiveLayouts } from 'react-grid-layout/legacy'
import { Service } from '@/lib/config'

export interface SavedLayoutData {
  hash: string
  layouts: ResponsiveLayouts
}

const STORAGE_KEY = 'bordus-grid-layout'

const hashServices = (services: Service[]) => {
  return services.map(s => s.name).join('|') + '|v13'
}

const generateDefaultLayout = (services: Service[]): ResponsiveLayouts => {
  const lg = services.map((service, i) => ({
    i: service.name,
    x: (i % 8),
    y: Math.floor(i / 8),
    w: 1, h: 1, minW: 1, minH: 1
  }))

  const md = services.map((service, i) => ({
    i: service.name,
    x: (i % 6),
    y: Math.floor(i / 6),
    w: 1, h: 1, minW: 1, minH: 1
  }))

  const sm = services.map((service, i) => ({
    i: service.name,
    x: (i % 4),
    y: Math.floor(i / 4),
    w: 1, h: 1, minW: 1, minH: 1
  }))

  const xs = services.map((service, i) => ({
    i: service.name,
    x: (i % 3),
    y: Math.floor(i / 3),
    w: 1, h: 1, minW: 1, minH: 1
  }))

  const xxs = services.map((service, i) => ({
    i: service.name,
    x: (i % 3),
    y: Math.floor(i / 3),
    w: 1, h: 1, minW: 1, minH: 1
  }))

  return { lg, md, sm, xs, xxs }
}

export const useGridLayout = (services: Service[]) => {
  const [layouts, setLayouts] = useState<ResponsiveLayouts | null>(() => {
    if (!services || services.length === 0) return null
    const saved = localStorage.getItem(STORAGE_KEY)
    const currentHash = hashServices(services)
    
    if (saved) {
      try {
        const parsed: SavedLayoutData = JSON.parse(saved)
        if (parsed.hash === currentHash && parsed.layouts) {
          return parsed.layouts
        }
      } catch (e) {
        console.error('Failed to parse layouts from local storage', e)
      }
    }
    
    return generateDefaultLayout(services)
  })

  const [isCustomized, setIsCustomized] = useState(() => {
    if (!services || services.length === 0) return false
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: SavedLayoutData = JSON.parse(saved)
        return parsed.hash === hashServices(services)
      }
    } catch {
      return false
    }
    return false
  })

  const onLayoutChange = useCallback((_: Layout, allLayouts: ResponsiveLayouts) => {
    if (!services) return

    setLayouts(allLayouts)
    setIsCustomized(true)
    
    try {
      const data: SavedLayoutData = {
        hash: hashServices(services),
        layouts: allLayouts
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save layout to localStorage', e)
    }
  }, [services])

  const resetLayout = useCallback(() => {
    if (!services) return
    localStorage.removeItem(STORAGE_KEY)
    setIsCustomized(false)
    setLayouts(generateDefaultLayout(services))
  }, [services])

  const currentHash = useMemo(() => services ? hashServices(services) : '', [services])
  const [lastHash, setLastHash] = useState(currentHash)

  if (currentHash !== lastHash && services) {
    setLastHash(currentHash)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      let parsed: SavedLayoutData | null = null
      if (saved) {
        parsed = JSON.parse(saved)
      }
      if (parsed && parsed.hash === currentHash) {
        setLayouts(parsed.layouts)
        setIsCustomized(true)
      } else {
        setLayouts(generateDefaultLayout(services))
        setIsCustomized(false)
      }
    } catch {
      setLayouts(generateDefaultLayout(services))
      setIsCustomized(false)
    }
  }

  return {
    layouts,
    onLayoutChange,
    resetLayout,
    isCustomized
  }
}
