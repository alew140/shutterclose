export type Theme = 'default' | 'blue' | 'green' | 'purple' | 'gold' | 'red'
export type Target = string | HTMLElement | Element

export interface SignConfig {
  icon?: string
  title: string
  subtitle?: string
  theme?: Theme
}

export interface ShutterCloseOptions {
  slats?: number
  duration?: number
  heightMultiplier?: number
  deceleration?: number
  easing?: string
  sign?: SignConfig
  onClose?: () => void
  onOpen?: () => void
}

export interface GlobalConfig {
  injectCSS?: boolean
  defaults?: Partial<ShutterCloseOptions>
}

export class ShutterCloseTargetError extends Error {
  constructor(target: string | Element | null) {
    super(`ShutterClose: target not found — ${String(target)}`)
    this.name = 'ShutterCloseTargetError'
  }
}
