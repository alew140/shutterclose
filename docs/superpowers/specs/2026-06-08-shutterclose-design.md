# shutterclose.js — Design Spec
**Date:** 2026-06-08  
**Status:** Specification complete — advancing to Pseudocode

---

## Overview

`shutterclose` is a zero-dependency CSS/JS animation library that covers any HTML element with an animated roller-shutter effect (sliding slats) and reveals a customizable "closed" sign. Published as a single npm package with subpath exports for vanilla JS, React, and Vue.

---

## Acceptance Criteria

- **AC-1:** Core vanilla API works in ESM, CJS, IIFE, and UMD formats — consuming project imports `shutterclose` and the animation runs correctly.
- **AC-2:** CSS auto-injects into `<head>` on first use with deduplication (no double injection on multiple imports).
- **AC-3:** `shutterclose/no-css` subpath disables auto-inject; `shutterclose/dist/shutterclose.css` is importable separately.
- **AC-4:** Fluent builder API chains correctly: `.target(el).slats(8).theme('blue').sign({…}).close()` returns a Promise that resolves after animation completes.
- **AC-5:** Options object API works: `new ShutterClose(el, options)` creates a reusable instance with `.close()`, `.open()`, `.destroy()`.
- **AC-6:** `ShutterClose.configure({ defaults: {…}, injectCSS: false })` sets global defaults inherited by all instances.
- **AC-7:** `shutterclose/react` exports `ShutterClose` component and `useShutterClose` hook — both fully typed with TypeScript generics.
- **AC-8:** `shutterclose/vue` exports `ShutterClose` SFC component and `useShutterClose` composable — both fully typed.
- **AC-9:** All subpath exports ship `.d.ts` TypeScript declarations.
- **AC-10:** React and Vue are peer dependencies — not bundled into dist.

---

## Constraints

- **Single package** — no monorepo; one `npm publish`, one `package.json`, subpath exports via `"exports"` field.
- **Zero runtime dependencies** for the core — no lodash, no animate.css, nothing.
- **React ≥ 18, Vue ≥ 3** as peer dependencies for respective wrappers.
- **Modern browsers only** — Chrome/Firefox/Safari/Edge last 2 versions; no IE11.
- **Build tool: tsup** — generates all formats from TypeScript source.
- **TypeScript 5 strict** — `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `strict: true`.
- **No side effects at import time** except CSS injection (tree-shakeable; declared in `sideEffects` field).

---

## Edge Cases

- **EC-1: Double CSS injection** — `css-injector.ts` checks for existing `<style id="shutterclose-css">` before injecting; safe to import from multiple files.
- **EC-2: Target not found** — `ShutterClose` throws `ShutterCloseTargetError` (typed subclass of Error) if selector matches nothing or element is null.
- **EC-3: Interrupted animation** — calling `.open()` while `.close()` is still animating cancels the animation via `Animation.cancel()` and resolves both promises cleanly.
- **EC-4: Multiple instances on same element** — second instance calls `destroy()` on any existing instance found via a WeakMap registry, then takes over.
- **EC-5: Element removed from DOM mid-animation** — MutationObserver or try/catch on animation events resolves the promise without throwing.
- **EC-6: SSR / no-DOM environments** — all DOM access guarded by `typeof document !== 'undefined'`; safe to import in Next.js / Nuxt SSR.
- **EC-7: Zero-duration animation** — `duration: 0` skips animation frame and directly applies final state.

---

## API Design

### Core types (`src/core/types.ts`)

```typescript
type Theme = 'default' | 'blue' | 'green' | 'purple' | 'gold' | 'red'
type Target = string | HTMLElement | Element

interface SignConfig {
  icon?: string
  title: string
  subtitle?: string
  theme?: Theme
}

interface ShutterCloseOptions {
  slats?: number            // default: 8
  duration?: number         // default: 2 (seconds)
  heightMultiplier?: number // default: 3
  deceleration?: number     // default: 97 (%)
  easing?: string           // overrides auto-generated cubic-bezier
  sign?: SignConfig
  onClose?: () => void
  onOpen?: () => void
}

interface GlobalConfig {
  injectCSS?: boolean                    // default: true
  defaults?: Partial<ShutterCloseOptions>
}
```

### Core class (`src/core/ShutterClose.ts`)

```typescript
class ShutterClose {
  // Static API
  static configure(config: GlobalConfig): void
  static close(target: Target, options?: ShutterCloseOptions): Promise<void>
  static open(target: Target): Promise<void>
  static target(target: Target): ShutterCloseBuilder  // fluent entry point

  // Instance API
  constructor(target: Target, options?: ShutterCloseOptions)
  close(): Promise<void>
  open(): Promise<void>
  destroy(): void
  readonly isShut: boolean
}
```

### Builder (`src/core/Builder.ts`)

```typescript
class ShutterCloseBuilder {
  slats(count: number): this
  duration(seconds: number): this
  heightMultiplier(mult: number): this
  deceleration(percent: number): this
  easing(curve: string): this
  theme(name: Theme): this
  sign(config: SignConfig): this
  onClose(fn: () => void): this
  onOpen(fn: () => void): this
  close(): Promise<void>
  open(): Promise<void>
}
```

### React wrapper (`src/react/`)

```tsx
// Component
interface ShutterCloseProps extends ShutterCloseOptions {
  children: React.ReactNode
  isShut?: boolean
  onClosed?: () => void
  onOpened?: () => void
  className?: string
  style?: React.CSSProperties
}
export function ShutterClose(props: ShutterCloseProps): JSX.Element

// Hook
export function useShutterClose(
  ref: React.RefObject<HTMLElement>,
  options?: ShutterCloseOptions
): {
  close: () => Promise<void>
  open: () => Promise<void>
  toggle: () => Promise<void>
  isShut: boolean
}
```

### Vue wrapper (`src/vue/`)

```typescript
// Component — same props as options + isShut: boolean
// Emits: 'closed', 'opened'

// Composable
export function useShutterClose(
  el: Ref<HTMLElement | null>,
  options?: MaybeRef<ShutterCloseOptions>
): {
  close: () => Promise<void>
  open: () => Promise<void>
  toggle: () => Promise<void>
  isShut: Readonly<Ref<boolean>>
}
```

---

## Package structure

```
shutterclose/
├── src/
│   ├── core/
│   │   ├── index.ts
│   │   ├── ShutterClose.ts
│   │   ├── Builder.ts
│   │   ├── types.ts
│   │   ├── defaults.ts
│   │   ├── easing.ts
│   │   ├── css-injector.ts
│   │   └── shutterclose.css
│   ├── react/
│   │   ├── index.tsx
│   │   ├── ShutterClose.tsx
│   │   └── useShutterClose.ts
│   └── vue/
│       ├── index.ts
│       ├── ShutterClose.vue
│       └── useShutterClose.ts
├── tests/
│   ├── core/
│   ├── react/
│   └── vue/
├── dist/                    (generated)
├── tsup.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## Distribution (package.json exports)

```json
{
  "exports": {
    ".": { "import": "./dist/index.esm.js", "require": "./dist/index.cjs.js", "types": "./dist/index.d.ts" },
    "./react": { "import": "./dist/react/index.esm.js", "require": "./dist/react/index.cjs.js", "types": "./dist/react/index.d.ts" },
    "./vue": { "import": "./dist/vue/index.esm.js", "require": "./dist/vue/index.cjs.js", "types": "./dist/vue/index.d.ts" },
    "./no-css": { "import": "./dist/no-css.esm.js", "require": "./dist/no-css.cjs.js", "types": "./dist/index.d.ts" },
    "./dist/shutterclose.css": "./dist/shutterclose.css"
  }
}
```

Build formats: ESM · CJS · IIFE (`window.ShutterClose`) · UMD · `.d.ts` declarations · standalone CSS

---

## Tech stack

| Tool | Role |
|------|------|
| tsup | Build — all formats + type declarations |
| TypeScript 5 strict | Source language |
| Vitest + happy-dom | Unit tests with DOM simulation |
| Changesets | Semantic versioning + CHANGELOG |
| GitHub Actions | CI: lint → test → build → npm publish |
