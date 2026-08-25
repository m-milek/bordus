import { Section } from "@/components/Section"
import { Category } from "@/lib/config"

export interface SectionGridProps {
  categories?: Category[]
  columns?: number
}

export const SectionGrid = ({ categories, columns = 1 }: SectionGridProps) => {
  if (!categories || categories.length === 0) {
    return null
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: '1.5rem'
  }

  return (
    <div style={gridStyle}>
      {categories.map((category, index) => (
        <Section key={index} category={category} />
      ))}
    </div>
  )
}
