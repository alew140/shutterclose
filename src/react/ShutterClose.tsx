import React, { useRef, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useShutterClose } from './useShutterClose'
import type { ShutterCloseOptions } from '../core/types'

export interface ShutterCloseProps extends ShutterCloseOptions {
  children: React.ReactNode
  isShut?: boolean
  onClosed?: () => void
  onOpened?: () => void
  className?: string
  style?: CSSProperties
}

export function ShutterClose({
  children,
  isShut: isShutProp = false,
  onClosed,
  onOpened,
  className,
  style,
  ...opts
}: ShutterCloseProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const hookOpts = {
    ...opts,
    ...(onClosed !== undefined && { onClose: onClosed }),
    ...(onOpened !== undefined && { onOpen: onOpened }),
  }
  const { close, open } = useShutterClose(
    ref as React.RefObject<HTMLElement>,
    hookOpts,
  )

  const prevRef = useRef(isShutProp)
  useEffect(() => {
    if (isShutProp === prevRef.current) return
    prevRef.current = isShutProp
    if (isShutProp) void close()
    else void open()
  }, [isShutProp, close, open])

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {children}
    </div>
  )
}
