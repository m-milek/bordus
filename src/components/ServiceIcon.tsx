import { useState } from 'react'

export interface ServiceIconProps {
  name: string
  className?: string
  fallback?: React.ReactNode
}

export const ServiceIcon = ({ name, className, fallback }: ServiceIconProps) => {
  const [hasError, setHasError] = useState(false)

  let iconSrc = name
  if (!name.includes('/') && !name.includes('.')) {
    iconSrc = `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${name}.png`
  }

  if (hasError || !name) {
    if (fallback) return <>{fallback}</>
    return null
  }

  return (
    <img 
      src={iconSrc} 
      alt={`${name} icon`} 
      className={className}
      onError={() => setHasError(true)} 
    />
  )
}
