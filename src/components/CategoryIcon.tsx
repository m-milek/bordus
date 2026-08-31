import { useState } from "react"
import { CATEGORY_ICONS, isImageRef } from "@/lib/categoryIcons"

export interface CategoryIconProps {
  name: string
  className?: string
}

export const CategoryIcon = ({ name, className }: CategoryIconProps) => {
  const [hasError, setHasError] = useState(false)

  if (hasError) return null

  if (isImageRef(name)) {
    return (
      <img
        src={name}
        alt=""
        className={className}
        onError={() => setHasError(true)}
      />
    )
  }

  const IconComponent = CATEGORY_ICONS[name.toLowerCase()]
  if (!IconComponent) return null

  return <IconComponent className={className} />
}
