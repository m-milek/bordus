import { Settings, Lock, LockOpen, RotateCcw, Download, Check } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useState } from "react"
import { stringify } from "yaml"
import type { DashboardLayoutState } from "@/hooks/useDashboardLayout"

export interface SettingsWidgetProps {
  isEditMode?: boolean
  onToggleEditMode?: () => void
  onResetLayout?: () => void
  showResetLayout?: boolean
  layout?: DashboardLayoutState
}

export const SettingsWidget = ({ 
  isEditMode, 
  onToggleEditMode, 
  onResetLayout, 
  showResetLayout,
  layout
}: SettingsWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleExport = () => {
    if (!layout) return
    const yamlString = stringify({ gridLayout: layout })
    navigator.clipboard.writeText(yamlString).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="flex flex-col gap-1 mb-2 bg-card border border-border shadow-xl rounded-xl p-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <ThemeToggle />
          
          {showResetLayout && (
            <button
              onClick={onResetLayout}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-destructive/20 text-destructive transition-colors w-full"
              title="Reset to default layout"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
          
          {onToggleEditMode && (
            <button
              onClick={onToggleEditMode}
              className={`inline-flex items-center justify-center rounded-md p-2 transition-colors w-full ${
                isEditMode 
                  ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              title={isEditMode ? "Lock layout" : "Edit layout"}
            >
              {isEditMode ? <LockOpen className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </button>
          )}

          {isEditMode && layout && (
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-green-500/20 text-green-600 dark:text-green-400 transition-colors w-full"
              title="Copy layout YAML to clipboard"
            >
              {copied ? <Check className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Settings"
      >
        <Settings className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
    </div>
  )
}
