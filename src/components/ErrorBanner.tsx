import { AlertTriangle } from 'lucide-react'

export interface ErrorBannerProps {
  error: string
}

export const ErrorBanner = ({ error }: ErrorBannerProps) => {
  return (
    <div className="bg-destructive/15 text-destructive border-l-4 border-destructive p-4 mb-8 rounded-md flex items-start gap-3 shadow-sm">
      <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="flex-1">
        <h3 className="font-bold">Configuration Error</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    </div>
  )
}
