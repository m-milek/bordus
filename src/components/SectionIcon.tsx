import * as LucideIcons from 'lucide-react'

export interface SectionIconProps {
  name: string
  className?: string
}

export const SectionIcon = ({ name, className }: SectionIconProps) => {
  if (name.includes('/') || name.includes('.')) {
    return <img src={name} alt="Section icon" className={className} />
  }

  const pascalName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  const IconComponent = LucideIcons[pascalName as keyof typeof LucideIcons]

  if (!IconComponent) {
    return null
  }

  return <IconComponent className={className} />
}
