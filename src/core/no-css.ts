import { ShutterClose } from './ShutterClose'
import { ShutterCloseBuilder } from './Builder'
import type { Target } from './types'

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
