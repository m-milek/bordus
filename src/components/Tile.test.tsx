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


  it('falls back to initials if icon is not provided', () => {
    const service = {
      name: 'Fallback Service',
      url: 'http://test.com'
    }
    render(<Tile service={service} />)
    expect(screen.getByText('F')).toBeInTheDocument()
  })
})
