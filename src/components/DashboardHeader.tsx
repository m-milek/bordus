import { ThemeToggle } from "@/components/ThemeToggle"

export interface DashboardHeaderProps {
  title?: string
  titleSize?: string
}

export const DashboardHeader = ({ title = 'Dashboard', titleSize }: DashboardHeaderProps) => {
  return (
    <div className="grid grid-cols-3 items-center mb-10">
      <div></div>
      <h1 
        className={`font-bold text-center justify-self-center ${titleSize ? '' : 'text-3xl'}`}
        style={titleSize ? { fontSize: titleSize } : undefined}
      >
        {title}
      </h1>
      <div className="justify-self-end">
        <ThemeToggle />
      </div>
    </div>
  )
}
