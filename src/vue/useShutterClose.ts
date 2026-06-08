import { ref, readonly, toValue, onUnmounted, type Ref, type MaybeRefOrGetter } from 'vue'
import { ShutterClose as SC } from '../core/ShutterClose'
import type { ShutterCloseOptions } from '../core/types'

export function useShutterClose(
  el: Ref<HTMLElement | null>,
  options?: MaybeRefOrGetter<ShutterCloseOptions>,
) {
  const isShut = ref(false)
  let instance: SC | null = null

  function getOpts(): ShutterCloseOptions {
    return toValue(options) ?? {}
  }

  async function close(): Promise<void> {
    if (!el.value) return
    const opts = getOpts()
    instance = new SC(el.value, {
      ...opts,
      onClose: () => {
        isShut.value = true
        opts.onClose?.()
      },
    })
    await instance.close()
  }

  async function open(): Promise<void> {
    if (!instance) return
    await instance.open()
    isShut.value = false
    getOpts().onOpen?.()
  }

  function toggle(): Promise<void> {
    return isShut.value ? open() : close()
  }

  onUnmounted(() => instance?.destroy())

  return { close, open, toggle, isShut: readonly(isShut) }
}
