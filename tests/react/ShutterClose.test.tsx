import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import React, { useState } from 'react'
import { ShutterClose } from '../../src/react/ShutterClose'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('ShutterClose React component', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ShutterClose><p>Hello</p></ShutterClose>
    )
    expect(getByText('Hello')).not.toBeNull()
  })

  it('renders a div wrapper', () => {
    const { container } = render(
      <ShutterClose><span>Hi</span></ShutterClose>
    )
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('applies className prop to wrapper div', () => {
    const { container } = render(
      <ShutterClose className="my-panel"><span /></ShutterClose>
    )
    expect((container.firstChild as HTMLElement).className).toContain('my-panel')
  })

  it('wrapper div has position:relative style', () => {
    const { container } = render(
      <ShutterClose><span /></ShutterClose>
    )
    expect((container.firstChild as HTMLElement).style.position).toBe('relative')
  })

  it('triggers close animation when isShut changes to true', async () => {
    function Wrapper() {
      const [shut, setShut] = useState(false)
      return (
        <>
          <button onClick={() => setShut(true)}>Close</button>
          <ShutterClose isShut={shut} duration={0.1}><span>Content</span></ShutterClose>
        </>
      )
    }
    const { container, getByText } = render(<Wrapper />)
    act(() => { getByText('Close').click() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(container.querySelector('.sc-shutter')).not.toBeNull()
  })

  it('calls onClosed callback when animation finishes', async () => {
    const onClosed = vi.fn()
    function Wrapper() {
      const [shut, setShut] = useState(false)
      return (
        <>
          <button onClick={() => setShut(true)}>Close</button>
          <ShutterClose isShut={shut} duration={0.1} onClosed={onClosed}><span /></ShutterClose>
        </>
      )
    }
    const { getByText } = render(<Wrapper />)
    act(() => { getByText('Close').click() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(onClosed).toHaveBeenCalledOnce()
  })
})
