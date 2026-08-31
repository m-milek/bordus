import { Component, ErrorInfo, ReactNode } from "react"
import { ZodError } from "zod"

interface Props {
  children?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    // A Zod failure bubbling up is a bad config.yaml; show which fields.
    const message =
      error instanceof ZodError
        ? error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ")
        : error.message || "Unknown error"

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 font-sans text-foreground">
        <div className="w-full max-w-xl rounded-xl border border-destructive/20 bg-destructive/10 p-8 shadow-lg">
          <h1 className="mb-4 text-2xl font-bold text-destructive">
            Something went wrong
          </h1>
          <p className="mb-6 font-mono text-sm break-words whitespace-pre-wrap text-destructive/80">
            {message}
          </p>
          <button
            className="rounded-md bg-destructive px-4 py-2 font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}
