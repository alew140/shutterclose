import { useRef, useState, useCallback, useEffect } from 'react'
import { ShutterClose } from '../core/ShutterClose'
import type { ShutterCloseOptions } from '../core/types'

export function useShutterClose(
  ref: React.RefObject<HTMLElement | null>,
  options?: ShutterCloseOptions,
) {
  const [isShut, setIsShut] = useState(false)
  const instanceRef = useRef<ShutterClose | null>(null)
  const optsRef = useRef(options)
  optsRef.current = options

  const close = useCallback(async () => {
    if (!ref.current) return
    const instance = new ShutterClose(ref.current, {
      ...optsRef.current,
      onClose: () => {
        setIsShut(true)
        optsRef.current?.onClose?.()
      },
    })
    instanceRef.current = instance
    await instance.close()
  }, [ref])

  const open = useCallback(async () => {
    if (!instanceRef.current) return
    await instanceRef.current.open()
    setIsShut(false)
    optsRef.current?.onOpen?.()
  }, [])

  const toggle = useCallback(
    () => (isShut ? open() : close()),
    [isShut, open, close],
  )

  useEffect(() => () => { instanceRef.current?.destroy() }, [])

  return { close, open, toggle, isShut }
}
