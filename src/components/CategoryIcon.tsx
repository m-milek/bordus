import { useState } from 'react'
import * as LucideIcons from 'lucide-react'

export interface CategoryIconProps {
  name: string
  className?: string
}

export const CategoryIcon = ({ name, className }: CategoryIconProps) => {
  const [hasError, setHasError] = useState(false)

  if (hasError) return null

  if (name.includes('/') || name.includes('.')) {
    return <img src={name} alt="Category icon" className={className} onError={() => setHasError(true)} />
  }

  const pascalName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[pascalName]

  if (!IconComponent) {
    return null
  }

  return <IconComponent className={className} />
}
