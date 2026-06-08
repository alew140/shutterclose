import type { ShutterCloseOptions } from './types'

export const DEFAULT_OPTIONS = {
  slats: 8,
  duration: 2,
  heightMultiplier: 3,
  deceleration: 97,
} as const satisfies Required<Pick<ShutterCloseOptions, 'slats' | 'duration' | 'heightMultiplier' | 'deceleration'>>
