import * as LucideIcons from 'lucide-react'

export interface SectionIconProps {
  name: string
  className?: string
}

export const SectionIcon = ({ name, className }: SectionIconProps) => {
  // If it's a URL or local file path
  if (name.includes('/') || name.includes('.')) {
    return <img src={name} alt="Section icon" className={className} />
  }

  // Convert kebab-case or lowercase to PascalCase (e.g. "file-text" -> "FileText")
  const pascalName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  const IconComponent = (LucideIcons as any)[pascalName]

  if (!IconComponent) {
    // Fallback if the lucide icon isn't found
    return null
  }

  return <IconComponent className={className} />
}
