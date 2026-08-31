import { Service } from '@/lib/config'
import { ServiceIcon } from "@/components/ServiceIcon"
import { getTileColorClasses } from "@/lib/colors"

export interface TileProps {
  service: Service
}

export const Tile = ({ service }: TileProps) => {
  const colorClasses = getTileColorClasses(service.categoryColor)

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full w-full"
    >
      {/*
        A plain tinted surface: no border and no ring, because the category's
        frame already draws the only outline this needs. Hovering brings a faint
        one in as the affordance.
      */}
      <div
        className={`@container flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl p-2 ring-0 transition-shadow duration-200 hover:ring-1 hover:ring-foreground/15 ${colorClasses}`}
        style={{ containerType: 'inline-size' }}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <ServiceIcon
            name={service.icon || ''}
            className="h-[50%] w-[50%] object-contain transition-transform duration-300 group-hover:scale-110"
            fallback={
              <div className="flex aspect-square h-[50%] w-[50%] items-center justify-center rounded-xl bg-background text-[20cqi] font-bold text-muted-foreground transition-transform duration-300 group-hover:scale-110">
                {service.name.charAt(0)}
              </div>
            }
          />
        </div>
        <div className="flex w-full min-w-0 flex-shrink-0 flex-col items-center px-1">
          <span className="w-full text-center text-[12cqi] leading-tight font-medium break-words text-foreground line-clamp-2 sm:text-[max(0.95rem,10cqi)]">
            {service.name}
          </span>
        </div>
      </div>
    </a>
  )
}
