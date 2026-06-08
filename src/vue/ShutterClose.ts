import { defineComponent, ref, watch, h, type PropType } from 'vue'
import { useShutterClose } from './useShutterClose'
import type { SignConfig } from '../core/types'

export const ShutterClose = defineComponent({
  name: 'ShutterClose',
  props: {
    isShut: { type: Boolean, default: false },
    slats: { type: Number },
    duration: { type: Number },
    heightMultiplier: { type: Number },
    deceleration: { type: Number },
    easing: { type: String },
    sign: { type: Object as PropType<SignConfig> },
  },
  emits: ['closed', 'opened'],
  setup(props, { slots, emit }) {
    const el = ref<HTMLElement | null>(null)

    const { close, open } = useShutterClose(el, () => ({
      ...(props.slats !== undefined && { slats: props.slats }),
      ...(props.duration !== undefined && { duration: props.duration }),
      ...(props.heightMultiplier !== undefined && { heightMultiplier: props.heightMultiplier }),
      ...(props.deceleration !== undefined && { deceleration: props.deceleration }),
      ...(props.easing !== undefined && { easing: props.easing }),
      ...(props.sign !== undefined && { sign: props.sign }),
      onClose: () => emit('closed'),
      onOpen: () => emit('opened'),
    }))

    watch(
      () => props.isShut,
      async (val, old) => {
        if (val === old) return
        if (val) await close()
        else await open()
      },
    )

    return () => h('div', { ref: el, style: { position: 'relative' } }, slots.default?.())
  },
})

export default ShutterClose
