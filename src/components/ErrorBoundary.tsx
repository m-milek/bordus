import { Component, ErrorInfo, ReactNode } from "react";
import { ZodError } from "zod";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const error = this.state.error;
      let errorMessage = error?.message;

      // Pretty print Zod errors if it's a validation error bubbling up
      if (error instanceof ZodError) {
        errorMessage = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      }

      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 font-sans">
          <div className="max-w-xl w-full bg-destructive/10 border border-destructive/20 rounded-xl p-8 shadow-lg">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <p className="text-destructive/80 mb-6 font-mono text-sm break-words whitespace-pre-wrap">
              {errorMessage || "Unknown error"}
            </p>
            <button
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-medium hover:bg-destructive/90 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
