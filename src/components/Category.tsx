
import { Category as CategoryType, Layout } from '@/lib/config'
import { Tile } from "@/components/Tile"
import { getColorClasses } from "@/lib/colors"
import { GripVertical } from "lucide-react"

export interface CategoryProps {
  category: CategoryType
  layout?: Layout
  showDragHandle?: boolean
}

export const Category = ({ category, layout, showDragHandle = false }: CategoryProps) => {

  return (
    <div className={`relative h-full bg-card text-card-foreground rounded-lg flex flex-col overflow-hidden ${getColorClasses(category.color)}`}>
      {showDragHandle && (
        <div className="absolute top-1 right-2 z-20 drag-handle cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground/50 transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Scrollable area taking remaining height */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4">
        <div 
          className="grid gap-4 content-start min-h-full" 
          style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--col-width) - 48px), 1fr))',
            gridAutoRows: 'minmax(calc(var(--col-width) - 48px), 1fr)'
          }}
        >
          {category.services.map((service, index) => (
            <div key={index}>
              <Tile service={service} layout={layout} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
