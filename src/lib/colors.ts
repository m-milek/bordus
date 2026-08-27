export type PredefinedColor = 
  | "red" | "blue" | "green" | "orange" | "purple" | "primary" 
  | "yellow" | "pink" | "cyan" | "teal" | "indigo" | "rose" | "gray"

export const getColorClasses = (colorName?: string) => {
  if (!colorName) return "bg-transparent border-border"
  
  const colors: Record<string, string> = {
    red: "bg-red-500/10 border-red-500/50",
    blue: "bg-blue-500/10 border-blue-500/50",
    green: "bg-green-500/10 border-green-500/50",
    orange: "bg-orange-500/10 border-orange-500/50",
    purple: "bg-purple-500/10 border-purple-500/50",
    primary: "bg-primary/10 border-primary/50",
    yellow: "bg-yellow-500/10 border-yellow-500/50",
    pink: "bg-pink-500/10 border-pink-500/50",
    cyan: "bg-cyan-500/10 border-cyan-500/50",
    teal: "bg-teal-500/10 border-teal-500/50",
    indigo: "bg-indigo-500/10 border-indigo-500/50",
    rose: "bg-rose-500/10 border-rose-500/50",
    gray: "bg-gray-500/10 border-gray-500/50",
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
    yellow: "bg-yellow-500 text-black",
    pink: "bg-pink-500 text-white",
    cyan: "bg-cyan-500 text-black",
    teal: "bg-teal-500 text-white",
    indigo: "bg-indigo-500 text-white",
    rose: "bg-rose-500 text-white",
    gray: "bg-gray-500 text-white",
  }

  return colors[colorName.toLowerCase()] || "bg-muted text-muted-foreground"
}
