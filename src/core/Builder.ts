import type { Target, ShutterCloseOptions, SignConfig, Theme } from './types'
import { ShutterClose } from './ShutterClose'

export class ShutterCloseBuilder {
  private readonly _target: Target
  private _opts: ShutterCloseOptions = {}

  constructor(target: Target) {
    this._target = target
  }

  slats(count: number): this {
    this._opts = { ...this._opts, slats: count }
    return this
  }

  duration(seconds: number): this {
    this._opts = { ...this._opts, duration: seconds }
    return this
  }

  heightMultiplier(mult: number): this {
    this._opts = { ...this._opts, heightMultiplier: mult }
    return this
  }

  deceleration(percent: number): this {
    this._opts = { ...this._opts, deceleration: percent }
    return this
  }

  easing(curve: string): this {
    this._opts = { ...this._opts, easing: curve }
    return this
  }

  theme(name: Theme): this {
    this._opts = {
      ...this._opts,
      sign: { title: '', ...this._opts.sign, theme: name },
    }
    return this
  }

  sign(config: SignConfig): this {
    this._opts = {
      ...this._opts,
      sign: { ...this._opts.sign, ...config },
    }
    return this
  }

  onClose(fn: () => void): this {
    this._opts = { ...this._opts, onClose: fn }
    return this
  }

  onOpen(fn: () => void): this {
    this._opts = { ...this._opts, onOpen: fn }
    return this
  }

  close(): Promise<void> {
    return new ShutterClose(this._target, this._opts).close()
  }

  open(): Promise<void> {
    return ShutterClose.open(this._target)
  }
}
