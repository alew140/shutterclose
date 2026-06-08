import { describe, it, expect } from 'vitest'
import { ShutterCloseTargetError } from '../../src/core/types'

describe('ShutterCloseTargetError', () => {
  it('is instance of Error', () => {
    const err = new ShutterCloseTargetError('#missing')
    expect(err).toBeInstanceOf(Error)
  })

  it('has correct name', () => {
    const err = new ShutterCloseTargetError('#missing')
    expect(err.name).toBe('ShutterCloseTargetError')
  })

  it('message includes the target string', () => {
    const err = new ShutterCloseTargetError('#my-panel')
    expect(err.message).toContain('#my-panel')
  })

  it('accepts null target', () => {
    const err = new ShutterCloseTargetError(null)
    expect(err.message).toContain('null')
  })
})
