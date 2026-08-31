import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

const WIDTH = 1184

vi.mock('react-grid-layout', async importOriginal => {
  const actual = await importOriginal<typeof import('react-grid-layout')>()
  return {
    ...actual,
    useContainerWidth: () => ({
      width: WIDTH,
      mounted: true,
      containerRef: { current: null },
      measure: () => {}
    })
  }
})

const CONFIG = `
title: Test Dashboard
search: true
categories:
  - name: Media
    color: blue
    icon: play
    services:
      - name: Plex
        url: http://plex.local
      - name: Jellyfin
        url: http://jellyfin.local
  - name: Downloads
    color: green
    rows: 1
    services:
      - name: Radarr
        url: http://radarr.local
      - name: Sonarr
        url: http://sonarr.local
      - name: Lidarr
        url: http://lidarr.local
      - name: Prowlarr
        url: http://prowlarr.local
      - name: SABnzbd
        url: http://sabnzbd.local
`

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, text: async () => CONFIG }))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('renders every category as its own container with its tiles inside', async () => {
    render(<App />)

    const media = await screen.findByText('Media')
    expect(media.closest('.category-item')).toBeInTheDocument()

    // Tiles live inside their category's scroll viewport, not the page grid.
    const mediaItem = media.closest('.category-item')!
    expect(mediaItem.querySelector('.category-body')).toContainElement(
      screen.getByText('Plex')
    )
    expect(mediaItem).not.toContainElement(screen.getByText('Radarr'))
  })

  it('scrolls a category that cannot show all of its tiles', async () => {
    render(<App />)

    const downloads = (await screen.findByText('Downloads')).closest('.category-item')!
    const body = downloads.querySelector<HTMLElement>('.category-body')!

    expect(body.style.overflowY).toBe('')
    expect(body).toHaveClass('overflow-y-auto')
    expect(body.style.scrollSnapType).toBe('y mandatory')
    // Five services across four columns is two rows in a one-row viewport.
    expect(body.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
  })

  it('swaps to a flat result grid while searching and restores categories after', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('Media')
    const search = screen.getByRole('searchbox')

    await user.type(search, 'radarr')
    await waitFor(() => expect(screen.queryByText('Downloads')).not.toBeInTheDocument())
    expect(screen.getByText('Radarr')).toBeInTheDocument()
    expect(screen.queryByText('Plex')).not.toBeInTheDocument()
    expect(document.querySelector('.category-item')).toBeNull()

    await user.clear(search)
    await waitFor(() => expect(screen.getByText('Downloads')).toBeInTheDocument())
    expect(screen.getByText('Plex')).toBeInTheDocument()
  })

  it('leaves the saved layout untouched while searching', async () => {
    const user = userEvent.setup()
    render(<App />)

    await screen.findByText('Media')
    await user.type(screen.getByRole('searchbox'), 'plex')
    await waitFor(() => expect(screen.queryByText('Jellyfin')).not.toBeInTheDocument())

    expect(localStorage.getItem('bordus-grid-layout')).toBeNull()
  })
})
