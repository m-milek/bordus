import { describe, it, expect } from 'vitest'
import { parseConfig } from './config'

describe('parseConfig', () => {
  it('parses a valid configuration', () => {
    const validYaml = `
title: My Homelab
theme: auto
search: true
categories:
  - name: Media
    color: red
    icon: film
    services:
      - name: Plex
        url: http://plex.local
        icon: plex
    `
    const config = parseConfig(validYaml)
    expect(config.title).toBe('My Homelab')
    expect(config.search).toBe(true)
    expect(config.categories?.[0].services[0].name).toBe('Plex')
  })

  it('throws an error when parsing an invalid schema', () => {
    const invalidYaml = `
categories:
  - name: Media
    services:
      - name: Missing URL
    `
    expect(() => parseConfig(invalidYaml)).toThrow()
  })

  it('throws an error on invalid YAML syntax', () => {
    const invalidSyntax = `
categories:
  - name: [Unclosed bracket
    `
    expect(() => parseConfig(invalidSyntax)).toThrow()
  })

  it('parses empty or minimal configuration correctly', () => {
    const config = parseConfig('title: Minimal')
    expect(config.title).toBe('Minimal')
    expect(config.categories).toBeUndefined()
  })

  it('parses category sizing keys', () => {
    const config = parseConfig(`
categories:
  - name: Media
    w: 6
    rows: 2
    layout:
      lg: { x: 0, y: 0, w: 8, rows: 3 }
      md: { w: 3 }
    services:
      - name: Plex
        url: http://plex.local
    `)
    const category = config.categories?.[0]
    expect(category?.w).toBe(6)
    expect(category?.rows).toBe(2)
    expect(category?.layout?.lg).toEqual({ x: 0, y: 0, w: 8, rows: 3 })
    expect(category?.layout?.md).toEqual({ w: 3 })
  })

  it('rejects a fractional category width', () => {
    expect(() =>
      parseConfig(`
categories:
  - name: Media
    w: 2.5
    services:
      - name: Plex
        url: http://plex.local
    `)
    ).toThrow()
  })

  it('parses an exported gridLayout block', () => {
    const config = parseConfig(`
gridLayout:
  categories:
    lg:
      - { i: Media, x: 0, y: 0, w: 4, rows: 2 }
      - { i: Downloads, x: 4, y: 0, w: 4, rows: 1 }
  tiles:
    Media:
      lg:
        - { i: Plex, x: 0, y: 0, w: 1, h: 1 }
categories:
  - name: Media
    services:
      - name: Plex
        url: http://plex.local
    `)
    expect(config.gridLayout?.categories?.lg).toHaveLength(2)
    expect(config.gridLayout?.categories?.lg?.[1]).toEqual({
      i: 'Downloads',
      x: 4,
      y: 0,
      w: 4,
      rows: 1
    })
    expect(config.gridLayout?.tiles?.Media?.lg?.[0].i).toBe('Plex')
  })

  it('rejects a gridLayout entry that stores a pixel height instead of rows', () => {
    expect(() =>
      parseConfig(`
gridLayout:
  categories:
    lg:
      - { i: Media, x: 0, y: 0, w: 4, h: 340 }
    `)
    ).toThrow()
  })
})
