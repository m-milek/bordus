import { useState, useCallback, useMemo } from 'react'
import { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout/legacy'
import { Category } from '@/lib/config'

const STORAGE_KEY = 'bordus-grid-layout'

// Generate a deterministic hash of category names to detect staleness
const hashCategories = (categories: Category[]) => {
  return categories.map(c => c.name).join('|') + '|v6'
}

const predictHeight = (serviceCount: number) => {
  // Now that the grid is made of perfect squares (rowHeight = colWidth),
  // 1 unit of height is huge (e.g. 200px).
  // A category width is w=2. So a perfect square category is h=2.
  if (serviceCount <= 4) return 1 // 2x1 rectangle
  return 2 // 2x2 square
}

const generateDefaultLayout = (categories: Category[]): ResponsiveLayouts => {
  const layout: LayoutItem[] = categories.map((cat, i) => {
    const w = 2 // Default width: 2 global columns (out of 6)
    return {
      i: cat.name,
      x: (i % 3) * w, 
      y: Math.floor(i / 3) * 2, // 2 rows tall max
      w,
      h: predictHeight(cat.services.length),
      minW: 1,
      minH: 1
    }
  })

  return {
    lg: layout,
    md: layout.map(l => ({ ...l, w: 2, x: (layout.indexOf(l) % 3) * 2 })),
    sm: layout.map((l, index) => {
      // Calculate y by summing heights of all previous items
      const previousHeights = layout.slice(0, index).reduce((acc, curr) => acc + curr.h, 0)
      return { ...l, w: 1, x: 0, y: previousHeights }
    })
  }
}

interface SavedLayoutData {
  hash: string
  layouts: ResponsiveLayouts
}

export const useGridLayout = (categories: Category[] | undefined, initialGridLayout?: ResponsiveLayouts) => {
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => {
    if (!categories || categories.length === 0) return {} as ResponsiveLayouts

    const currentHash = hashCategories(categories)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: SavedLayoutData = JSON.parse(saved)
        // If the categories have changed (added/removed/renamed), discard saved layout
        if (parsed.hash === currentHash && parsed.layouts) {
          return parsed.layouts
        }
      }
    } catch (e) {
      console.warn('Failed to load layout from local storage', e)
    }

    // Fallback to config provided layout or default
    if (initialGridLayout) return initialGridLayout
    return generateDefaultLayout(categories)
  })

  const [isCustomized, setIsCustomized] = useState(() => {
    if (!categories || categories.length === 0) return false
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: SavedLayoutData = JSON.parse(saved)
        return parsed.hash === hashCategories(categories)
      }
    } catch {
      return false
    }
    return false
  })

  const onLayoutChange = useCallback((_: Layout, allLayouts: ResponsiveLayouts) => {
    if (!categories) return

    setLayouts(allLayouts)
    setIsCustomized(true)
    
    try {
      const data: SavedLayoutData = {
        hash: hashCategories(categories),
        layouts: allLayouts
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save layout to localStorage', e)
    }
  }, [categories])

  const resetLayout = useCallback(() => {
    if (!categories) return
    localStorage.removeItem(STORAGE_KEY)
    setIsCustomized(false)
    setLayouts(initialGridLayout || generateDefaultLayout(categories))
  }, [categories, initialGridLayout])

  // If categories list changes completely (e.g. from loading config), update internal state
  // But don't do this with a useEffect on initial mount to avoid layout shift
  // We use useMemo to derive the expected hash
  const currentHash = useMemo(() => categories ? hashCategories(categories) : '', [categories])
  const [lastHash, setLastHash] = useState(currentHash)

  if (currentHash !== lastHash && categories) {
    // Categories have updated significantly (new config loaded after mount or search filtered them?)
    // Actually, wait, search filtering shouldn't destroy layout.
    // The hash should only include categories that exist in BOTH.
    // If we filter, it just means some are missing. RGL can handle missing items.
    // So we only reset if it's a completely different config?
    // Let's just update the lastHash and let the component render.
    // If the saved layout matches the new hash, use it, else default.
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
        setLayouts(initialGridLayout || generateDefaultLayout(categories))
        setIsCustomized(false)
      }
    } catch {
      setLayouts(initialGridLayout || generateDefaultLayout(categories))
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
