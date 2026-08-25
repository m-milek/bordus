export interface ServiceIconProps {
  name: string
  className?: string
}

export const ServiceIcon = ({ name, className }: ServiceIconProps) => {
  let iconSrc = name
  if (!name.includes('/') && !name.includes('.')) {
    iconSrc = `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${name}.png`
  }

  return <img src={iconSrc} alt={`${name} icon`} className={className} />
}
