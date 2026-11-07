import { useMemo } from "react"
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type Layout,
  type ResponsiveLayouts,
} from "react-grid-layout"
import { gridBounds, minMaxSize } from "react-grid-layout/core"
import {
  Category,
  CategoryPlacement,
  TilePlacement,
  Widget,
} from "@/lib/config"
import { CategoryCard } from "@/components/CategoryCard"
import { WidgetCard } from "@/components/WidgetCard"
import {
  BREAKPOINTS,
  BreakpointName,
  COLS,
  GAP,
  PAGE_PAD,
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

type GridItem =
  | { kind: "category"; category: Category; placement: CategoryPlacement }
  | { kind: "widget"; widget: Widget; placement: CategoryPlacement }

export interface CategoryGridProps {
  categories?: Category[]
  widgets?: Widget[]
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
  widgets,
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
  const visible = useMemo<GridItem[]>(() => {
    const byName = new Map((placements[breakpoint] ?? []).map((p) => [p.i, p]))
    const categoryItems = (categories ?? []).flatMap((category) => {
      const placement = byName.get(category.name)
      return placement
        ? [{ kind: "category" as const, category, placement }]
        : []
    })
    const widgetItems = (widgets ?? []).flatMap((widget) => {
      const placement = byName.get(widget.name)
      return placement ? [{ kind: "widget" as const, widget, placement }] : []
    })
    return [...categoryItems, ...widgetItems]
  }, [categories, widgets, placements, breakpoint])

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

  if (!categories?.length && !widgets?.length) return null

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
          // A 1px row unit plus a vertical margin of zero lets category heights
          // be exact pixel values; the gap between stacked categories is baked
          // into the bottom of each item instead.
          rowHeight={1}
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
          {visible.map((item) => (
            <div key={item.placement.i} className="category-item">
              {item.kind === "category" ? (
                <CategoryCard
                  category={item.category}
                  width={item.placement.w}
                  rows={item.placement.rows}
                  cell={cell}
                  tiles={tiles[item.category.name]?.[breakpoint] ?? []}
                  isEditMode={isEditMode}
                  onTilesChange={(next) =>
                    onTileLayoutChange?.(item.category.name, breakpoint, next)
                  }
                />
              ) : (
                <WidgetCard
                  widget={item.widget}
                  width={item.placement.w}
                  rows={item.placement.rows}
                  cell={cell}
                  isEditMode={isEditMode}
                />
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}
