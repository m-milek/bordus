import { useCallback, useMemo, useState } from 'react'
import {
  Category,
  CategoryPlacement,
  DashboardLayout,
  DashboardLayoutSchema,
  TilePlacement
} from '@/lib/config'
import { BREAKPOINT_NAMES, BreakpointName, COLS } from '@/lib/grid'

const STORAGE_KEY = 'bordus-grid-layout'
const VERSION = 'v14'

/** Default category width in tile columns, per breakpoint. */
const DEFAULT_WIDTH: Record<BreakpointName, number> = { lg: 4, md: 3, sm: 4, xs: 3, xxs: 2 }
/** Categories taller than this scroll by default rather than growing the page. */
const MAX_DEFAULT_ROWS = 3
/**
 * Vertical spacing between generated categories. `y` is only ever a sort key --
 * the grid's vertical compactor packs items against each other -- so the stride
 * just has to be larger than any category could plausibly be.
 */
const Y_STRIDE = 1000

export type CategoryPlacements = Partial<Record<BreakpointName, CategoryPlacement[]>>
export type TilePlacements = Record<string, Partial<Record<BreakpointName, TilePlacement[]>>>

export interface DashboardLayoutState {
  categories: CategoryPlacements
  tiles: TilePlacements
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const hashCategories = (categories: Category[]) =>
  categories.map(cat => `${cat.name}:${cat.services.map(s => s.name).join(',')}`).join('|') +
  `|${VERSION}`

const defaultTiles = (category: Category, width: number): TilePlacement[] =>
  category.services.map((service, i) => ({
    i: service.name,
    x: i % width,
    y: Math.floor(i / width),
    w: 1,
    h: 1
  }))

const generateDefaults = (categories: Category[]): DashboardLayoutState => {
  const placements: CategoryPlacements = {}
  const tiles: TilePlacements = {}

  for (const category of categories) {
    tiles[category.name] = {}
  }

  for (const breakpoint of BREAKPOINT_NAMES) {
    const cols = COLS[breakpoint]
    let cursorX = 0
    let cursorRow = 0

    placements[breakpoint] = categories.map(category => {
      const override = category.layout?.[breakpoint]
      const width = clamp(
        override?.w ?? category.w ?? DEFAULT_WIDTH[breakpoint],
        1,
        cols
      )
      const rows =
        override?.rows ??
        category.rows ??
        clamp(Math.ceil(category.services.length / width), 1, MAX_DEFAULT_ROWS)

      if (cursorX + width > cols) {
        cursorX = 0
        cursorRow += 1
      }
      const x = override?.x ?? cursorX
      const y = override?.y ?? cursorRow * Y_STRIDE
      cursorX = x + width

      tiles[category.name][breakpoint] = defaultTiles(category, width)

      return { i: category.name, x: clamp(x, 0, cols - width), y, w: width, rows }
    })
  }

  return { categories: placements, tiles }
}

/**
 * Overlays a saved layout onto generated defaults. Anything the override does
 * not mention keeps its default, and anything it mentions that no longer exists
 * in the config is dropped.
 */
const applyOverride = (
  base: DashboardLayoutState,
  override: DashboardLayout | undefined,
  categories: Category[]
): DashboardLayoutState => {
  if (!override) return base

  const known = new Set(categories.map(c => c.name))
  const merged: DashboardLayoutState = {
    categories: { ...base.categories },
    tiles: { ...base.tiles }
  }

  for (const breakpoint of BREAKPOINT_NAMES) {
    const saved = override.categories?.[breakpoint]
    if (!saved) continue

    const cols = COLS[breakpoint]
    const byName = new Map(saved.filter(p => known.has(p.i)).map(p => [p.i, p]))

    merged.categories[breakpoint] = (base.categories[breakpoint] ?? []).map(fallback => {
      const placement = byName.get(fallback.i)
      if (!placement) return fallback
      const w = clamp(placement.w, 1, cols)
      return {
        i: fallback.i,
        x: clamp(placement.x, 0, cols - w),
        y: placement.y,
        w,
        rows: Math.max(1, placement.rows)
      }
    })
  }

  for (const category of categories) {
    const savedTiles = override.tiles?.[category.name]
    if (!savedTiles) continue

    const serviceNames = new Set(category.services.map(s => s.name))
    for (const breakpoint of BREAKPOINT_NAMES) {
      const saved = savedTiles[breakpoint]
      if (!saved) continue

      const categoryWidth =
        merged.categories[breakpoint]?.find(p => p.i === category.name)?.w ??
        DEFAULT_WIDTH[breakpoint]
      const byName = new Map(saved.filter(p => serviceNames.has(p.i)).map(p => [p.i, p]))

      merged.tiles[category.name] = {
        ...merged.tiles[category.name],
        [breakpoint]: (base.tiles[category.name]?.[breakpoint] ?? []).map(fallback => {
          const placement = byName.get(fallback.i)
          if (!placement) return fallback
          const w = clamp(placement.w, 1, categoryWidth)
          return {
            i: fallback.i,
            x: clamp(placement.x, 0, categoryWidth - w),
            y: placement.y,
            w,
            h: Math.max(1, placement.h)
          }
        })
      }
    }
  }

  return merged
}

const readSaved = (hash: string): DashboardLayout | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.hash !== hash) return null
    return DashboardLayoutSchema.parse(parsed.layout)
  } catch {
    // A layout from an older version of the app, or hand-edited storage.
    return null
  }
}

const buildLayout = (
  categories: Category[],
  configLayout: DashboardLayout | undefined,
  hash: string
): { layout: DashboardLayoutState; isCustomized: boolean } => {
  const defaults = generateDefaults(categories)
  const fromConfig = applyOverride(defaults, configLayout, categories)
  const saved = readSaved(hash)
  return {
    layout: saved ? applyOverride(fromConfig, saved, categories) : fromConfig,
    isCustomized: saved !== null
  }
}

export const useDashboardLayout = (
  categories: Category[] | undefined,
  configLayout: DashboardLayout | undefined
) => {
  const hash = useMemo(() => (categories ? hashCategories(categories) : ''), [categories])
  const [state, setState] = useState(() =>
    categories
      ? buildLayout(categories, configLayout, hash)
      : { layout: { categories: {}, tiles: {} } as DashboardLayoutState, isCustomized: false }
  )
  const [lastHash, setLastHash] = useState(hash)

  // Rebuild when the config's categories or services change underneath us.
  if (hash !== lastHash) {
    setLastHash(hash)
    setState(
      categories
        ? buildLayout(categories, configLayout, hash)
        : { layout: { categories: {}, tiles: {} }, isCustomized: false }
    )
  }

  const persist = useCallback(
    (layout: DashboardLayoutState) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ hash, layout }))
    },
    [hash]
  )

  const onCategoryLayoutChange = useCallback(
    (breakpoint: BreakpointName, placements: CategoryPlacement[]) => {
      setState(previous => {
        const layout: DashboardLayoutState = {
          ...previous.layout,
          categories: { ...previous.layout.categories, [breakpoint]: placements }
        }
        persist(layout)
        return { layout, isCustomized: true }
      })
    },
    [persist]
  )

  const onTileLayoutChange = useCallback(
    (categoryName: string, breakpoint: BreakpointName, placements: TilePlacement[]) => {
      setState(previous => {
        const layout: DashboardLayoutState = {
          ...previous.layout,
          tiles: {
            ...previous.layout.tiles,
            [categoryName]: {
              ...previous.layout.tiles[categoryName],
              [breakpoint]: placements
            }
          }
        }
        persist(layout)
        return { layout, isCustomized: true }
      })
    },
    [persist]
  )

  const resetLayout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    if (!categories) return
    const defaults = generateDefaults(categories)
    setState({
      layout: applyOverride(defaults, configLayout, categories),
      isCustomized: false
    })
  }, [categories, configLayout])

  return {
    layout: state.layout,
    isCustomized: state.isCustomized,
    onCategoryLayoutChange,
    onTileLayoutChange,
    resetLayout
  }
}
