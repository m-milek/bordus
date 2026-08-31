import { Service } from "@/lib/config"
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

        The ring is inset. A normal one is painted outside the element, and the
        tile block sits flush against its scrolling container, so the outer edge
        of every tile on a boundary would have its ring clipped away -- an
        outline visible on two sides and not the other two.
      */}
      <div
        className={`@container flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl p-2 transition-shadow duration-200 hover:inset-ring hover:inset-ring-foreground/15 ${colorClasses}`}
        style={{ containerType: "inline-size" }}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <ServiceIcon
            name={service.icon || ""}
            className="h-[60%] w-[60%] object-contain transition-transform duration-300 group-hover:scale-110"
            fallback={
              <div className="flex aspect-square h-[60%] w-[60%] items-center justify-center rounded-xl bg-background text-[20cqi] font-bold text-muted-foreground transition-transform duration-300 group-hover:scale-110">
                {service.name.charAt(0)}
              </div>
            }
          />
        </div>
        <div className="flex w-full min-w-0 flex-shrink-0 flex-col items-center px-1">
          {/*
            Sized from the tile, not the viewport. The old `sm:` floor was a
            media query, so it never applied on the narrow screens whose tiles
            are smallest -- exactly backwards. The clamp holds the label in a
            15.2-17.6px band at every tile size.
          */}
          <span className="line-clamp-2 w-full text-center text-[clamp(0.95rem,11cqi,1.1rem)] leading-tight font-medium break-words text-foreground">
            {service.name}
          </span>
        </div>
      </div>
    </a>
  )
}
