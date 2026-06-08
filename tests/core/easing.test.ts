import { describe, it, expect } from 'vitest'
import { generateEasing } from '../../src/core/easing'

describe('generateEasing', () => {
  it('returns a valid cubic-bezier string', () => {
    const result = generateEasing(97)
    expect(result).toMatch(/^cubic-bezier\([\d.,\s]+\)$/)
  })

  it('four numeric values inside cubic-bezier', () => {
    const result = generateEasing(97)
    const match = result.match(/cubic-bezier\(([^)]+)\)/)
    expect(match).not.toBeNull()
    const values = match![1]!.split(',').map(Number)
    expect(values).toHaveLength(4)
    values.forEach(v => expect(isNaN(v)).toBe(false))
  })

  it('higher deceleration produces larger x2 value', () => {
    const low = generateEasing(50)
    const high = generateEasing(99)
    const x2Low = parseFloat(low.match(/cubic-bezier\([^,]+,[^,]+,([^,]+)/)![1]!)
    const x2High = parseFloat(high.match(/cubic-bezier\([^,]+,[^,]+,([^,]+)/)![1]!)
    expect(x2High).toBeGreaterThan(x2Low)
  })

  it('x2 and y2 are clamped within [0,1]', () => {
    ;[0, 50, 97, 100].forEach(decel => {
      const result = generateEasing(decel)
      const match = result.match(/cubic-bezier\(([^)]+)\)/)!
      const [, , x2, y2] = match[1]!.split(',').map(Number)
      expect(x2).toBeGreaterThanOrEqual(0)
      expect(x2).toBeLessThanOrEqual(1)
      expect(y2).toBeGreaterThanOrEqual(0)
      expect(y2).toBeLessThanOrEqual(1)
    })
  })
})
