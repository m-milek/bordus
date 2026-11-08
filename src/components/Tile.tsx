import { Service } from "@/lib/config"
import { ServiceIcon } from "@/components/ServiceIcon"
import { getFallbackGradient } from "@/lib/colors"

export interface TileProps {
  service: Service
  variant?: "category" | "search"
}

export const Tile = ({ service, variant = "category" }: TileProps) => {
  const surfaceClasses =
    variant === "search"
      ? "border border-foreground/[0.07] bg-card/50 hover:bg-card"
      : "hover:bg-foreground/[0.05]"

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full w-full"
    >
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-1 rounded-[14px] p-1.5 transition-colors duration-200 hover:inset-ring hover:inset-ring-foreground/10 ${surfaceClasses}`}
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <ServiceIcon
            name={service.icon || ""}
            className="h-[58%] max-h-20 w-[58%] max-w-20 object-contain transition-transform duration-300 group-hover:scale-110"
            fallback={
              <div
                className="flex aspect-square h-[58%] max-h-20 w-auto items-center justify-center rounded-2xl text-2xl font-semibold text-white shadow-sm ring-1 ring-white/10 transition-transform duration-300 ring-inset group-hover:scale-110"
                style={{ backgroundImage: getFallbackGradient(service.name) }}
              >
                {service.name.charAt(0)}
              </div>
            }
          />
        </div>
        <div className="flex w-full min-w-0 flex-shrink-0 flex-col items-center">
          <span
            title={service.name}
            className="line-clamp-2 w-full text-center text-[15px] leading-tight font-medium break-words text-foreground/80 transition-colors group-hover:text-foreground"
          >
            {service.name}
          </span>
        </div>
      </div>
    </a>
  )
}
