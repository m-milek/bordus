import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/ErrorBoundary"
// Imported here, ahead of our own stylesheet, so the grid's base rules land
// once for every grid on the page and our overrides still win.
import 'react-grid-layout/css/styles.css'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
