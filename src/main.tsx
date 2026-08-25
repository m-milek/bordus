import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { ThemeProvider } from "@/components/theme-provider"
import './styles.css'
import { loadConfig } from './lib/config'

async function init() {
  const { config, error } = await loadConfig()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <App config={config} error={error} />
      </ThemeProvider>
    </StrictMode>,
  )
}

init()
