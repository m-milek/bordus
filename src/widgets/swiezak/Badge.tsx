import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export interface BadgeProps {
  className: string
  title?: string
  icon?: LucideIcon
  children: ReactNode
}

export const Badge = ({
  className,
  title,
  icon: Icon,
  children,
}: BadgeProps) => (
  <span
    title={title}
    className={`inline-flex shrink-0 items-center gap-1 rounded-full py-0.5 pr-2 text-[11px] leading-none font-medium whitespace-nowrap ${Icon ? "pl-0.5" : "pl-2"} ${className}`}
  >
    {Icon && (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-current">
        <Icon className="h-2.5 w-2.5 text-background" strokeWidth={3} />
      </span>
    )}
    {children}
  </span>
)
