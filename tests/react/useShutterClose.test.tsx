import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRef } from 'react'
import { useShutterClose } from '../../src/react/useShutterClose'

beforeEach(() => {
  document.body.innerHTML = '<div id="target" style="position:relative"></div>'
  vi.useFakeTimers()
})

afterEach(() => vi.useRealTimers())

function setup() {
  const el = document.getElementById('target') as HTMLElement
  return renderHook(() => {
    const ref = useRef<HTMLElement>(el)
    return useShutterClose(ref, { duration: 0.1 })
  })
}

describe('useShutterClose', () => {
  it('returns close, open, toggle, isShut', () => {
    const { result } = setup()
    expect(typeof result.current.close).toBe('function')
    expect(typeof result.current.open).toBe('function')
    expect(typeof result.current.toggle).toBe('function')
    expect(result.current.isShut).toBe(false)
  })

  it('isShut becomes true after close()', async () => {
    const { result } = setup()
    act(() => { void result.current.close() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(result.current.isShut).toBe(true)
  })

  it('isShut becomes false after open()', async () => {
    const { result } = setup()
    act(() => { void result.current.close() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    act(() => { void result.current.open() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(result.current.isShut).toBe(false)
  })

  it('toggle() closes when currently open', async () => {
    const { result } = setup()
    act(() => { void result.current.toggle() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(result.current.isShut).toBe(true)
  })

  it('toggle() opens when currently shut', async () => {
    const { result } = setup()
    // Close first
    act(() => { void result.current.close() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    // Now toggle should open
    act(() => { void result.current.toggle() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(result.current.isShut).toBe(false)
  })
})
