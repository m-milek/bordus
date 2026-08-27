import { Category } from "@/components/Category"
import { Category as CategoryType, Layout as ConfigLayout } from "@/lib/config"
import { useState } from "react"
import { Responsive, WidthProvider, Layout, ResponsiveLayouts } from "react-grid-layout/legacy"

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

export interface CategoryGridProps {
  categories?: CategoryType[]
  layout?: ConfigLayout
  isEditMode?: boolean
  layouts?: ResponsiveLayouts
  onLayoutChange?: (currentLayout: Layout, allLayouts: ResponsiveLayouts) => void
}

export const CategoryGrid = ({ categories, layout, isEditMode = false, layouts, onLayoutChange }: CategoryGridProps) => {
  const [rowHeight, setRowHeight] = useState(150) // Default fallback

  if (!categories || categories.length === 0) return null

  const handleWidthChange = (containerWidth: number, margin: readonly [number, number], cols: number) => {
    const colWidth = (containerWidth - margin[0] * (cols - 1)) / cols
    setRowHeight(colWidth)
    document.documentElement.style.setProperty('--col-width', `${colWidth}px`)
  }

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 768, sm: 0 }}
      cols={{ lg: 6, md: 6, sm: 1 }}
      rowHeight={rowHeight}
      onWidthChange={handleWidthChange}
      isDraggable={isEditMode}
      isResizable={isEditMode}
      draggableHandle=".drag-handle"
      onLayoutChange={onLayoutChange}
      compactType="vertical"
      margin={[16, 16]}
      useCSSTransforms={true}
    >
      {categories.map((category) => (
        <div key={category.name}>
          <Category category={category} layout={layout} showDragHandle={isEditMode} />
        </div>
      ))}
    </ResponsiveGridLayout>
  )
}
