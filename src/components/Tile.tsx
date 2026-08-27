import { Service } from '@/lib/config'
import { ServiceIcon } from "@/components/ServiceIcon"
import { getColorClasses } from "@/lib/colors"
import { Card } from "@/components/ui/card"

export interface TileProps {
  service: Service
}

export const Tile = ({ service }: TileProps) => {
  const color = service.categoryColor || 'primary'
  const colorClasses = getColorClasses(color)

  return (
    <a 
      href={service.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full h-full group"
    >
      <Card className={`relative z-10 flex flex-col items-center justify-center h-full w-full shadow-sm hover:shadow-md transition-all duration-300 p-2 gap-1 border-2 ${colorClasses}`}>
        <div className="flex justify-center items-center flex-1 w-full min-h-0">
          <ServiceIcon 
            name={service.icon || ''} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 max-h-12 max-w-12" 
            fallback={
              <div className="aspect-square h-full max-h-12 bg-background rounded-xl flex items-center justify-center text-muted-foreground font-bold text-3xl group-hover:scale-110 transition-transform duration-300">
                {service.name.charAt(0)}
              </div>
            }
          />
        </div>
        <div className="flex flex-col w-full items-center min-w-0 flex-shrink-0 px-1">
          <span className="font-medium text-foreground text-center leading-tight line-clamp-2 break-words w-full text-sm">
            {service.name}
          </span>
        </div>
      </Card>
    </a>
  )
}
