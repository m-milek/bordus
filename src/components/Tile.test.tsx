import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Tile } from './Tile'

describe('Tile Component', () => {
  it('renders service name correctly', () => {
    const service = {
      name: 'Test Service',
      url: 'http://test.com',
      icon: 'globe'
    }
    render(<Tile service={service} />)
    expect(screen.getByText('Test Service')).toBeInTheDocument()
  })


  it('draws its hover outline inside itself, where nothing can clip it', () => {
    // Tiles sit flush against their category's scrolling viewport, so an
    // outward ring is cut off on whichever edges touch it -- leaving an outline
    // on two sides and not the other two.
    render(<Tile service={{ name: 'Plex', url: 'http://plex.local' }} />)

    const surface = screen.getByText('Plex').closest('a')!.firstElementChild!
    expect(surface.className).toContain('hover:inset-ring')
    expect(surface.className).not.toMatch(/(^|\s)hover:ring-/)
  })

  it('falls back to initials if icon is not provided', () => {
    const service = {
      name: 'Fallback Service',
      url: 'http://test.com'
    }
    render(<Tile service={service} />)
    expect(screen.getByText('F')).toBeInTheDocument()
  })
})
