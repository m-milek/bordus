import { Service } from "@/lib/config"
import { ServiceIcon } from "@/components/ServiceIcon"

export interface TileProps {
  service: Service
}

export const Tile = ({ service }: TileProps) => {
  return (
    <a 
      href={service.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-3 bg-background border border-transparent rounded-md hover:border-border transition-colors shadow-sm"
    >
      {service.icon ? (
        <ServiceIcon name={service.icon} className="w-10 h-10 object-contain" />
      ) : (
        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground font-bold">
          {service.name.charAt(0)}
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{service.name}</span>
        {service.description && (
          <span className="text-sm text-muted-foreground">{service.description}</span>
        )}
      </div>
    </a>
  )
}
