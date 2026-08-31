import { Service } from "@/lib/config"
import { ServiceIcon } from "@/components/ServiceIcon"
import { getTileColorClasses, getColorClasses } from "@/lib/colors"

export interface TileProps {
  service: Service
  /** "category" (default) uses a faint tint; "search" uses the pronounced
   *  category-card styling with a visible border so tiles stand out on their
   *  own outside a category wrapper. */
  variant?: "category" | "search"
}

export const Tile = ({ service, variant = "category" }: TileProps) => {
  const isSearch = variant === "search"
  const colorClasses = isSearch
    ? getColorClasses(service.categoryColor)
    : getTileColorClasses(service.categoryColor)

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
        className={`flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl p-2 transition-shadow duration-200 hover:inset-ring hover:inset-ring-foreground/15 ${colorClasses} ${isSearch ? "border-2" : ""}`}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <ServiceIcon
            name={service.icon || ""}
            className="h-[60%] w-[60%] object-contain transition-transform duration-300 group-hover:scale-110"
            fallback={
              <div className="flex aspect-square h-[60%] w-[60%] items-center justify-center rounded-xl bg-background text-3xl font-bold text-muted-foreground transition-transform duration-300 group-hover:scale-110">
                {service.name.charAt(0)}
              </div>
            }
          />
        </div>
        <div className="flex w-full min-w-0 flex-shrink-0 flex-col items-center px-1">
          {/*
            A fixed size. The grid holds every tile within a ~105-190px band at
            any screen width, so the label has no reason to scale with the tile.
          */}
          <span className="line-clamp-2 w-full text-center text-[0.95rem] leading-tight font-medium break-words text-foreground">
            {service.name}
          </span>
        </div>
      </div>
    </a>
  )
}
