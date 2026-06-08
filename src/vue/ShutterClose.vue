<script setup lang="ts">
import { ref, watch } from 'vue'
import { useShutterClose } from './useShutterClose'
import type { ShutterCloseOptions } from '../core/types'

interface Props extends ShutterCloseOptions {
  isShut?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), { isShut: false })

const emit = defineEmits<{
  closed: []
  opened: []
}>()

const el = ref<HTMLElement | null>(null)

const { close, open } = useShutterClose(el, () => ({
  slats: props.slats,
  duration: props.duration,
  heightMultiplier: props.heightMultiplier,
  deceleration: props.deceleration,
  easing: props.easing,
  sign: props.sign,
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
</script>

<template>
  <div ref="el" :class="props.class" style="position: relative">
    <slot />
  </div>
</template>
