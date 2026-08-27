export type PredefinedColor = 
  | "red" | "blue" | "green" | "orange" | "purple" | "primary"

export const getColorClasses = (colorName?: string) => {
  if (!colorName) return "bg-transparent border-border"
  
  const colors: Record<string, string> = {
    red: "bg-red-500/10 border-red-500/50",
    blue: "bg-blue-500/10 border-blue-500/50",
    green: "bg-green-500/10 border-green-500/50",
    orange: "bg-orange-500/10 border-orange-500/50",
    purple: "bg-purple-500/10 border-purple-500/50",
    primary: "bg-primary/10 border-primary/50",
  }

  return colors[colorName.toLowerCase()] || "bg-transparent border-border"
}

export const getSolidColorClasses = (colorName?: string) => {
  if (!colorName) return "bg-muted text-muted-foreground"
  
  const colors: Record<string, string> = {
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    orange: "bg-orange-500 text-white",
    purple: "bg-purple-500 text-white",
    primary: "bg-primary text-primary-foreground",
  }

  return colors[colorName.toLowerCase()] || "bg-muted text-muted-foreground"
}
