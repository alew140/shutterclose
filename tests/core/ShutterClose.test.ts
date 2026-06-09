import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ShutterClose } from '../../src/core/ShutterClose'
import { ShutterCloseTargetError } from '../../src/core/types'

beforeEach(() => {
  document.body.innerHTML = ''
  vi.useFakeTimers()
})

afterEach(() => {
  ShutterClose.configure({ injectCSS: true, defaults: {} })
  vi.useRealTimers()
})

function makePanel() {
  const el = document.createElement('div')
  el.id = 'panel'
  el.style.position = 'relative'
  document.body.appendChild(el)
  return el
}

describe('ShutterClose — constructor', () => {
  it('throws ShutterCloseTargetError for missing selector', () => {
    expect(() => new ShutterClose('#nonexistent')).toThrow(ShutterCloseTargetError)
  })

  it('accepts a CSS selector string', () => {
    makePanel()
    expect(() => new ShutterClose('#panel')).not.toThrow()
  })

  it('accepts an HTMLElement directly', () => {
    const el = makePanel()
    expect(() => new ShutterClose(el)).not.toThrow()
  })

  it('destroys previous instance on same element', () => {
    const el = makePanel()
    const first = new ShutterClose(el)
    const destroySpy = vi.spyOn(first, 'destroy')
    new ShutterClose(el)
    expect(destroySpy).toHaveBeenCalledOnce()
  })
})

describe('ShutterClose — close()', () => {
  it('appends sc-shutter element to target', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1, sign: { title: 'TEST' } })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(el.querySelector('.sc-shutter')).not.toBeNull()
  })

  it('creates correct number of slats', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { slats: 5, duration: 0.1 })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    const slats = el.querySelectorAll('.sc-slat')
    expect(slats.length).toBe(5)
  })

  it('sets isShut to true after close', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    expect(sc.isShut).toBe(false)
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(sc.isShut).toBe(true)
  })

  it('calls onClose callback', async () => {
    const el = makePanel()
    const onClose = vi.fn()
    const sc = new ShutterClose(el, { duration: 0.1, onClose })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calling close twice is a no-op second time', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    const p1 = sc.close()
    vi.advanceTimersByTime(500)
    await p1
    const p2 = sc.close()
    vi.advanceTimersByTime(500)
    await p2
    expect(el.querySelectorAll('.sc-shutter').length).toBe(1)
  })
})

describe('ShutterClose — open()', () => {
  it('removes sc-shutter element', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    const openPromise = sc.open()
    vi.advanceTimersByTime(500)
    await openPromise
    expect(el.querySelector('.sc-shutter')).toBeNull()
  })

  it('sets isShut to false after open', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    const openPromise = sc.open()
    vi.advanceTimersByTime(500)
    await openPromise
    expect(sc.isShut).toBe(false)
  })

  it('calls onOpen callback', async () => {
    const el = makePanel()
    const onOpen = vi.fn()
    const sc = new ShutterClose(el, { duration: 0.1, onOpen })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    const openPromise = sc.open()
    vi.advanceTimersByTime(500)
    await openPromise
    expect(onOpen).toHaveBeenCalledOnce()
  })
})

describe('ShutterClose — static API', () => {
  it('ShutterClose.configure sets global defaults', async () => {
    ShutterClose.configure({ defaults: { slats: 12 } })
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(el.querySelectorAll('.sc-slat').length).toBe(12)
  })

  it('ShutterClose.close() static creates instance and closes', async () => {
    const el = makePanel()
    const p = ShutterClose.close(el, { duration: 0.1 })
    vi.advanceTimersByTime(500)
    await p
    expect(el.querySelector('.sc-shutter')).not.toBeNull()
  })

  it('ShutterClose.target returns a function (placeholder)', () => {
    expect(typeof ShutterClose.target).toBe('function')
  })

  it('ShutterClose.open() on unregistered element resolves without error', async () => {
    const el = makePanel()
    await expect(ShutterClose.open(el)).resolves.toBeUndefined()
  })

  it('injectCSS: false skips style tag injection', () => {
    ShutterClose.configure({ injectCSS: false })
    const el = makePanel()
    new ShutterClose(el)
    expect(document.getElementById('shutterclose-css')).toBeNull()
  })

  it('auto-corrects static-positioned element to relative', async () => {
    const el = makePanel()
    el.style.position = 'static'
    const sc = new ShutterClose(el, { duration: 0.1 })
    const p = sc.close()
    vi.advanceTimersByTime(500)
    await p
    expect(el.style.position).toBe('relative')
  })

  it('destroy() resets isShut to false', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    const p = sc.close()
    vi.advanceTimersByTime(500)
    await p
    expect(sc.isShut).toBe(true)
    sc.destroy()
    expect(sc.isShut).toBe(false)
  })
})

describe('ShutterClose — sign', () => {
  it('renders sign element with correct title', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, {
      duration: 0.1,
      sign: { title: 'CERRADO', icon: '🔒', subtitle: 'Vuelvo pronto' },
    })
    const closePromise = sc.close()
    vi.advanceTimersByTime(2000)
    await closePromise
    const title = el.querySelector('.sc-sign-title')
    expect(title?.textContent).toBe('CERRADO')
    const icon = el.querySelector('.sc-sign-icon')
    expect(icon?.textContent).toBe('🔒')
    const sub = el.querySelector('.sc-sign-subtitle')
    expect(sub?.textContent).toBe('Vuelvo pronto')
  })

  it('applies theme class to sign', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, {
      duration: 0.1,
      sign: { title: 'TEST', theme: 'blue' },
    })
    const closePromise = sc.close()
    vi.advanceTimersByTime(2000)
    await closePromise
    expect(el.querySelector('.sc-sign--blue')).not.toBeNull()
  })
})
