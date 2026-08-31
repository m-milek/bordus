import { useMemo } from "react"
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type ResponsiveLayouts,
} from "react-grid-layout"
import { Service } from "@/lib/config"
import { Tile } from "@/components/Tile"
import {
  BREAKPOINTS,
  BREAKPOINT_NAMES,
  COLS,
  GAP,
  PAD,
  PAGE_PAD,
  cellSize,
  colsForWidth,
} from "@/lib/grid"

export interface SearchResultsGridProps {
  services?: Service[]
}

/**
 * The flat grid shown while a search is active. Its layout is derived from the
 * result order and never persisted, so searching can't disturb the category
 * layout the user has arranged.
 */
export const SearchResultsGrid = ({ services }: SearchResultsGridProps) => {
  // Measure before the first paint so the grid never renders at a guessed width.
  const { width, mounted, containerRef } = useContainerWidth({
    measureBeforeMount: true,
  })

  const layouts = useMemo<ResponsiveLayouts>(() => {
    const result: ResponsiveLayouts = {}
    for (const breakpoint of BREAKPOINT_NAMES) {
      const cols = COLS[breakpoint]
      result[breakpoint] = (services ?? []).map((service, i) => ({
        i: service.name,
        x: i % cols,
        y: Math.floor(i / cols),
        w: 1,
        h: 1,
      }))
    }
    return result
  }, [services])

  if (!services || services.length === 0) return null

  return (
    <div ref={containerRef} className="grid-locked min-h-[500px] w-full">
      {mounted && width > 0 && (
        <ResponsiveGridLayout
          className="layout"
          width={width}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={cellSize(width, colsForWidth(width))}
          margin={[GAP, GAP]}
          containerPadding={[PAGE_PAD, PAGE_PAD + PAD]}
          dragConfig={{ enabled: false }}
          resizeConfig={{ enabled: false }}
        >
          {services.map((service) => (
            <div key={service.name} className="relative">
              <Tile service={service} variant="search" />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}
