import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Category } from "@/lib/config"
import { Tile } from "@/components/Tile"
import { SectionIcon } from "@/components/SectionIcon"
import { getColorClasses } from "@/lib/colors"

export interface SectionProps {
  category: Category
}

export const Section = ({ category }: SectionProps) => {
  return (
    <Card className={`h-full shadow-none ring-0 border rounded-lg ${getColorClasses(category.color)}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          {category.icon && <SectionIcon name={category.icon} className="w-5 h-5 object-contain" />}
          {category.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {category.services.map((service, index) => (
            <Tile key={index} service={service} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
