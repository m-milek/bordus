export interface VersionFooterProps {
  version?: string
}

export const VersionFooter = ({
  version = import.meta.env.VITE_APP_VERSION ?? "dev",
}: VersionFooterProps) => (
  <footer className="mt-12 text-center text-xs text-muted-foreground/70">
    Bordus {version === "dev" ? version : `v${version}`}
  </footer>
)
