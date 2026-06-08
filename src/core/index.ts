import css from './shutterclose.css'
import { setCSSString } from './css-injector'
import { ShutterClose } from './ShutterClose'
import { ShutterCloseBuilder } from './Builder'
import type { Target } from './types'

setCSSString(css)

ShutterClose.target = (target: Target) => new ShutterCloseBuilder(target)

export { ShutterClose } from './ShutterClose'
export { ShutterCloseBuilder } from './Builder'
export type {
  Theme,
  Target,
  SignConfig,
  ShutterCloseOptions,
  GlobalConfig,
} from './types'
export { ShutterCloseTargetError } from './types'
