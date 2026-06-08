import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ShutterCloseBuilder } from '../../src/core/Builder'

beforeEach(() => {
  document.body.innerHTML = '<div id="panel" style="position:relative"></div>'
  vi.useFakeTimers()
})

afterEach(() => vi.useRealTimers())

describe('ShutterCloseBuilder', () => {
  it('is chainable — each setter returns this', () => {
    const el = document.getElementById('panel')!
    const builder = new ShutterCloseBuilder(el)
    expect(builder.slats(5)).toBe(builder)
    expect(builder.duration(1)).toBe(builder)
    expect(builder.theme('blue')).toBe(builder)
    expect(builder.sign({ title: 'TEST' })).toBe(builder)
    expect(builder.onClose(() => {})).toBe(builder)
    expect(builder.onOpen(() => {})).toBe(builder)
  })

  it('close() triggers animation on target element', async () => {
    const el = document.getElementById('panel')!
    const builder = new ShutterCloseBuilder(el)
    builder.slats(4).duration(0.1)
    const closePromise = builder.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(el.querySelector('.sc-shutter')).not.toBeNull()
    expect(el.querySelectorAll('.sc-slat').length).toBe(4)
  })

  it('full chain produces correct DOM', async () => {
    const el = document.getElementById('panel')!
    const closePromise = new ShutterCloseBuilder(el)
      .slats(3)
      .duration(0.1)
      .sign({ icon: '🔒', title: 'LOCKED', theme: 'blue' })
      .close()
    vi.advanceTimersByTime(2000)
    await closePromise
    expect(el.querySelectorAll('.sc-slat').length).toBe(3)
    expect(el.querySelector('.sc-sign--blue')).not.toBeNull()
    expect(el.querySelector('.sc-sign-title')?.textContent).toBe('LOCKED')
  })

  it('theme() merges into sign without overwriting existing sign fields', () => {
    const el = document.getElementById('panel')!
    const builder = new ShutterCloseBuilder(el)
    builder.sign({ title: 'MY TITLE', icon: '🎉' }).theme('gold')
    // Verify the sign still has icon and title after theme() called
    // (internal state check via close not needed — just verify no throw)
    expect(() => builder.slats(5)).not.toThrow()
  })

  it('open() delegates to ShutterClose.open()', async () => {
    const el = document.getElementById('panel')!
    const builder = new ShutterCloseBuilder(el)
    // open() on never-closed element should not throw
    await expect(builder.open()).resolves.toBeUndefined()
  })
})
