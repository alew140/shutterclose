import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { useShutterClose } from '../../src/vue/useShutterClose'

beforeEach(() => {
  document.body.innerHTML = '<div id="target" style="position:relative"></div>'
  vi.useFakeTimers()
})

afterEach(() => vi.useRealTimers())

describe('useShutterClose Vue composable', () => {
  it('returns close, open, toggle, isShut', () => {
    const el = ref(document.getElementById('target') as HTMLElement)
    const { close, open, toggle, isShut } = useShutterClose(el, { duration: 0.1 })
    expect(typeof close).toBe('function')
    expect(typeof open).toBe('function')
    expect(typeof toggle).toBe('function')
    expect(isShut.value).toBe(false)
  })

  it('isShut.value becomes true after close()', async () => {
    const el = ref(document.getElementById('target') as HTMLElement)
    const { close, isShut } = useShutterClose(el, { duration: 0.1 })
    const p = close()
    vi.advanceTimersByTime(500)
    await p
    expect(isShut.value).toBe(true)
  })

  it('isShut.value becomes false after open()', async () => {
    const el = ref(document.getElementById('target') as HTMLElement)
    const { close, open, isShut } = useShutterClose(el, { duration: 0.1 })
    const p1 = close()
    vi.advanceTimersByTime(500)
    await p1
    const p2 = open()
    vi.advanceTimersByTime(500)
    await p2
    expect(isShut.value).toBe(false)
  })

  it('toggle() closes when open', async () => {
    const el = ref(document.getElementById('target') as HTMLElement)
    const { toggle, isShut } = useShutterClose(el, { duration: 0.1 })
    const p = toggle()
    vi.advanceTimersByTime(500)
    await p
    expect(isShut.value).toBe(true)
  })

  it('toggle() opens when shut', async () => {
    const el = ref(document.getElementById('target') as HTMLElement)
    const { close, toggle, isShut } = useShutterClose(el, { duration: 0.1 })
    const p1 = close()
    vi.advanceTimersByTime(500)
    await p1
    const p2 = toggle()
    vi.advanceTimersByTime(500)
    await p2
    expect(isShut.value).toBe(false)
  })
})
