import type { Target, ShutterCloseOptions, GlobalConfig, SignConfig } from './types'
import { ShutterCloseTargetError } from './types'
import { DEFAULT_OPTIONS } from './defaults'
import { generateEasing } from './easing'
import { injectCSS } from './css-injector'

let globalConfig: GlobalConfig = { injectCSS: true, defaults: {} }

const registry = new WeakMap<Element, ShutterClose>()

function resolveTarget(target: Target): Element {
  if (typeof target === 'string') {
    const el = document.querySelector(target)
    if (!el) throw new ShutterCloseTargetError(target)
    return el
  }
  if (target instanceof Element) return target
  throw new ShutterCloseTargetError(null)
}

function mergeOpts(base: ShutterCloseOptions, override?: ShutterCloseOptions): ShutterCloseOptions {
  return { ...DEFAULT_OPTIONS, ...globalConfig.defaults, ...base, ...override }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function buildSign(sign: SignConfig): HTMLElement {
  const el = document.createElement('div')
  const themeClass = sign.theme && sign.theme !== 'default' ? ` sc-sign--${sign.theme}` : ''
  el.className = `sc-sign${themeClass}`

  if (sign.icon) {
    const icon = document.createElement('span')
    icon.className = 'sc-sign-icon'
    icon.textContent = sign.icon
    el.appendChild(icon)
  }

  const title = document.createElement('div')
  title.className = 'sc-sign-title'
  title.textContent = sign.title
  el.appendChild(title)

  if (sign.subtitle) {
    const sub = document.createElement('div')
    sub.className = 'sc-sign-subtitle'
    sub.textContent = sign.subtitle
    el.appendChild(sub)
  }

  return el
}

export class ShutterClose {
  private readonly el: Element
  private readonly opts: ShutterCloseOptions
  private shutterEl: HTMLElement | null = null
  private _isShut = false

  // Patched by index.ts after import to avoid circular dep with Builder
  static target: (target: Target) => { close(): Promise<void>; open(): Promise<void>; slats(n: number): unknown } =
    (_target: Target) => {
      throw new Error('ShutterClose.target() requires importing from "shutterclose", not the internal core module.')
    }

  static configure(config: GlobalConfig): void {
    globalConfig = {
      injectCSS: config.injectCSS ?? globalConfig.injectCSS ?? true,
      defaults: { ...globalConfig.defaults, ...config.defaults },
    }
  }

  static close(target: Target, options?: ShutterCloseOptions): Promise<void> {
    return new ShutterClose(target, options).close()
  }

  static open(target: Target): Promise<void> {
    const el = resolveTarget(target)
    return registry.get(el)?.open() ?? Promise.resolve()
  }

  constructor(target: Target, options?: ShutterCloseOptions) {
    this.el = resolveTarget(target)
    this.opts = options ?? {}
    registry.get(this.el)?.destroy()
    registry.set(this.el, this)
    if (globalConfig.injectCSS !== false) injectCSS()
  }

  async close(): Promise<void> {
    if (this._isShut) return

    const opts = mergeOpts(this.opts)
    const slats = opts.slats ?? DEFAULT_OPTIONS.slats
    const duration = opts.duration ?? DEFAULT_OPTIONS.duration
    const heightMultiplier = opts.heightMultiplier ?? DEFAULT_OPTIONS.heightMultiplier
    const deceleration = opts.deceleration ?? DEFAULT_OPTIONS.deceleration

    const parentEl = this.el as HTMLElement
    if (getComputedStyle(parentEl).position === 'static') {
      parentEl.style.position = 'relative'
    }

    const shutter = document.createElement('div')
    shutter.className = 'sc-shutter'
    this.shutterEl = shutter

    const panel = document.createElement('div')
    panel.className = 'sc-panel'
    panel.style.setProperty('--sc-start-y', `${-(heightMultiplier * 100)}%`)
    panel.style.setProperty('--sc-duration', `${duration}s`)
    panel.style.setProperty('--sc-easing', opts.easing ?? generateEasing(deceleration))

    const slatHeight = 100 / slats
    for (let i = 0; i < slats; i++) {
      const slat = document.createElement('div')
      slat.className = 'sc-slat'
      slat.style.top = `${i * slatHeight}%`
      slat.style.height = `${slatHeight}%`
      panel.appendChild(slat)
    }
    shutter.appendChild(panel)

    let signEl: HTMLElement | null = null
    if (opts.sign) {
      signEl = buildSign(opts.sign)
      shutter.appendChild(signEl)
    }

    this.el.appendChild(shutter)
    shutter.classList.add('sc-active')

    await sleep(duration * 1000 + 200)

    if (signEl) signEl.classList.add('sc-sign--show')

    this._isShut = true
    opts.onClose?.()
  }

  async open(): Promise<void> {
    if (!this._isShut || !this.shutterEl) return
    this.shutterEl.classList.remove('sc-active')
    await sleep(300)
    this.shutterEl.remove()
    this.shutterEl = null
    this._isShut = false
    mergeOpts(this.opts).onOpen?.()
  }

  destroy(): void {
    this.shutterEl?.remove()
    this.shutterEl = null
    this._isShut = false
    registry.delete(this.el)
  }

  get isShut(): boolean {
    return this._isShut
  }
}
