/** Built-in color themes for the closed sign. */
export type Theme = 'default' | 'blue' | 'green' | 'purple' | 'gold' | 'red'

/** Anything that resolves to a DOM element: a CSS selector string or an Element reference. */
export type Target = string | HTMLElement | Element

/** Configuration for the "closed" sign displayed after the shutter closes. */
export interface SignConfig {
  /** Emoji or short text shown above the title. */
  icon?: string
  /** Main text on the sign (e.g. "CERRADO", "CLOSED"). */
  title: string
  /** Secondary text shown below the title. */
  subtitle?: string
  /** Color theme for the sign background. Defaults to `'default'` (orange). */
  theme?: Theme
}

/** Options for a single ShutterClose animation. All fields are optional; unset fields fall back to global defaults then built-in defaults. */
export interface ShutterCloseOptions {
  /** Number of horizontal slats. Default: `8`. */
  slats?: number
  /** Total animation duration in seconds. Default: `2`. */
  duration?: number
  /** How tall the shutter panel is relative to the element height (e.g. `3` = 300%). Default: `3`. */
  heightMultiplier?: number
  /** Controls deceleration; higher = sharper stop. Range 0–100. Default: `97`. */
  deceleration?: number
  /** CSS `cubic-bezier` easing string. Overrides `deceleration` when set. */
  easing?: string
  /** Sign to reveal after the shutter closes. Omit to show no sign. */
  sign?: SignConfig
  /** Callback fired once the shutter has fully closed. */
  onClose?: () => void
  /** Callback fired once the shutter has fully opened. */
  onOpen?: () => void
}

/** Package-wide configuration applied to every new ShutterClose instance. */
export interface GlobalConfig {
  /** Whether to auto-inject the bundled CSS into `<head>`. Default: `true`. Set to `false` when using `shutterclose/no-css` or importing the CSS manually. */
  injectCSS?: boolean
  /** Default option overrides merged into every instance. */
  defaults?: Partial<ShutterCloseOptions>
}

/** Thrown when a CSS selector passed to ShutterClose does not match any element. */
export class ShutterCloseTargetError extends Error {
  constructor(target: string | Element | null) {
    super(`ShutterClose: target not found — ${String(target)}`)
    this.name = 'ShutterCloseTargetError'
  }
}
