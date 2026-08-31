import { useMemo } from "react"
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type Layout,
  type ResponsiveLayouts,
} from "react-grid-layout"
import { gridBounds, minMaxSize } from "react-grid-layout/core"
import { Category, CategoryPlacement, TilePlacement } from "@/lib/config"
import { CategoryCard } from "@/components/CategoryCard"
import {
  BREAKPOINTS,
  BreakpointName,
  COLS,
  GAP,
  PAGE_PAD,
  ROW_UNIT,
  breakpointForWidth,
  cellSize,
  colsForWidth,
  hFromRows,
  rowsFromH,
  wholeTileRows,
} from "@/lib/grid"
import type {
  CategoryPlacements,
  TilePlacements,
} from "@/hooks/useDashboardLayout"

export interface CategoryGridProps {
  categories?: Category[]
  placements: CategoryPlacements
  tiles: TilePlacements
  isEditMode?: boolean
  onCategoryLayoutChange?: (
    breakpoint: BreakpointName,
    placements: CategoryPlacement[]
  ) => void
  onTileLayoutChange?: (
    categoryName: string,
    breakpoint: BreakpointName,
    placements: TilePlacement[]
  ) => void
}

export const CategoryGrid = ({
  categories,
  placements,
  tiles,
  isEditMode = false,
  onCategoryLayoutChange,
  onTileLayoutChange,
}: CategoryGridProps) => {
  // Measure before the first paint so the grid never renders at a guessed width.
  const { width, mounted, containerRef } = useContainerWidth({
    measureBeforeMount: true,
  })

  const breakpoint = breakpointForWidth(width)
  const cols = colsForWidth(width)
  const cell = cellSize(width, cols)

  // Only categories that have a placement at this breakpoint are rendered, so
  // the children and the layout can never disagree.
  const visible = useMemo(() => {
    const byName = new Map((placements[breakpoint] ?? []).map((p) => [p.i, p]))
    return (categories ?? []).flatMap((category) => {
      const placement = byName.get(category.name)
      return placement ? [{ category, placement }] : []
    })
  }, [categories, placements, breakpoint])

  /*
   * `rows` is what gets stored, because it survives a change of screen; the
   * pixel height the grid works in is derived from the current cell size.
   * Only the active breakpoint is built -- the others would need a cell size
   * this container width cannot supply, and the grid only reads the active one.
   */
  const layouts = useMemo<ResponsiveLayouts>(
    () => ({
      [breakpoint]: visible.map(({ placement: { i, x, y, w, rows } }) => ({
        i,
        x,
        y,
        w,
        h: hFromRows(rows, cell),
        minW: 1,
      })),
    }),
    [visible, breakpoint, cell]
  )

  const constraints = useMemo(
    () => [gridBounds, minMaxSize, wholeTileRows(cell)],
    [cell]
  )

  /*
   * Persist on gesture end rather than on every layout change: the grid also
   * emits a change when it compacts the generated defaults, and treating that
   * as an edit would mark an untouched dashboard as customised.
   */
  const handleGestureEnd = (layout: Layout) => {
    if (!onCategoryLayoutChange || layout.length === 0) return
    onCategoryLayoutChange(
      breakpoint,
      layout.map(({ i, x, y, w, h }) => ({
        i,
        x,
        y,
        w,
        rows: rowsFromH(h, cell),
      }))
    )
  }

  if (!categories || categories.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={`min-h-[500px] w-full ${isEditMode ? "" : "grid-locked"}`}
    >
      {mounted && width > 0 && (
        <ResponsiveGridLayout
          className="layout"
          width={width}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={ROW_UNIT}
          // A vertical margin of zero lets category heights be exact pixel
          // values; the gap between stacked categories is baked into the
          // bottom of each item instead.
          margin={[GAP, 0]}
          containerPadding={[PAGE_PAD, PAGE_PAD]}
          constraints={constraints}
          dragConfig={{
            enabled: isEditMode,
            handle: ".category-drag-handle",
            cancel: ".category-body",
          }}
          resizeConfig={{ enabled: isEditMode }}
          onDragStop={handleGestureEnd}
          onResizeStop={handleGestureEnd}
        >
          {visible.map(({ category, placement }) => (
            <div key={category.name} className="category-item">
              <CategoryCard
                category={category}
                width={placement.w}
                rows={placement.rows}
                cell={cell}
                tiles={tiles[category.name]?.[breakpoint] ?? []}
                isEditMode={isEditMode}
                onTilesChange={(next) =>
                  onTileLayoutChange?.(category.name, breakpoint, next)
                }
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}
