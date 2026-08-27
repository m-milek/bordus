import { Service, Layout } from '@/lib/config'
import { ServiceIcon } from "@/components/ServiceIcon"

export interface TileProps {
  service: Service
  layout?: Layout
}

export const Tile = ({ service, layout }: TileProps) => {
  const isIconOnly = layout?.tileStyle === 'icon-only'
  
  const iconClass = 'w-12 h-12 text-2xl'
  const textSize = 'text-sm'
  const paddingClass = ''
  
  return (
    <a 
      href={service.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex flex-col items-center justify-center bg-background border border-transparent rounded-xl hover:border-border hover:shadow-md transition shadow-sm group w-full h-full overflow-hidden ${paddingClass}`}
    >
      <div className="mx-auto w-fit mt-1">
        <ServiceIcon 
          name={service.icon || ''} 
          className={`${iconClass} object-contain group-hover:scale-110 transition-transform duration-300`} 
          fallback={
            <div className={`${iconClass} bg-muted rounded-xl flex items-center justify-center text-muted-foreground font-bold group-hover:scale-110 transition-transform duration-300`}>
              {service.name.charAt(0)}
            </div>
          }
        />
      </div>
      {!isIconOnly && (
        <div className="flex flex-col w-full items-center min-w-0 overflow-hidden">
          <span className={`font-medium text-foreground text-center leading-tight line-clamp-2 break-words w-full ${textSize}`}>{service.name}</span>
        </div>
      )}
    </a>
  )
}
