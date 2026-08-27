import { describe, it, expect } from 'vitest'
import { parseConfig } from './config'

describe('parseConfig', () => {
  it('parses a valid configuration', () => {
    const validYaml = `
title: My Homelab
theme: auto
search: true
layout:
  sections: flexible
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
    expect(config.layout?.tileStyle).toBe('standard')
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
})
