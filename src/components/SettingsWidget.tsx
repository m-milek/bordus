import {
  Settings,
  Lock,
  LockOpen,
  RotateCcw,
  ClipboardCopy,
  Check,
} from "lucide-react"
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
  layout,
}: SettingsWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLayout = () => {
    if (!layout) return
    navigator.clipboard.writeText(stringify({ gridLayout: layout })).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => {}
    )
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="mb-2 flex animate-in flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-xl duration-200 fade-in slide-in-from-bottom-2">
          <ThemeToggle />

          {showResetLayout && (
            <button
              onClick={onResetLayout}
              className="inline-flex w-full items-center justify-center rounded-md p-2 text-destructive transition-colors hover:bg-destructive/20"
              title="Reset to default layout"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}

          {onToggleEditMode && (
            <button
              onClick={onToggleEditMode}
              className={`inline-flex w-full items-center justify-center rounded-md p-2 transition-colors ${
                isEditMode
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
              title={isEditMode ? "Lock layout" : "Edit layout"}
            >
              {isEditMode ? (
                <LockOpen className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </button>
          )}

          {isEditMode && layout && (
            <button
              onClick={handleCopyLayout}
              className="inline-flex w-full items-center justify-center rounded-md p-2 text-green-600 transition-colors hover:bg-green-500/20 dark:text-green-400"
              title="Copy layout YAML to clipboard"
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <ClipboardCopy className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="Settings"
      >
        <Settings
          className={`h-6 w-6 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
    </div>
  )
}
