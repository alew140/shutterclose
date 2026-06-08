# shutterclose.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish `shutterclose` — a zero-dependency, TypeScript-first npm package that animates any HTML element with a roller-shutter effect and customizable sign, with vanilla, React, and Vue distributions.

**Architecture:** Single npm package with subpath exports (`shutterclose`, `shutterclose/react`, `shutterclose/vue`, `shutterclose/no-css`). Core is a plain TypeScript class with a fluent builder sugar layer on top. React/Vue wrappers are thin adapters that delegate to the core. CSS is bundled as a string and auto-injected on first use.

**Tech Stack:** TypeScript 5 strict · tsup (ESM + CJS + IIFE) · Vitest + happy-dom · Changesets · GitHub Actions

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/core/types.ts` | All public TypeScript interfaces and error class |
| `src/core/defaults.ts` | Default option values |
| `src/core/easing.ts` | cubic-bezier string generator from deceleration % |
| `src/core/css-injector.ts` | Dedup-safe CSS injection into `<head>` |
| `src/core/shutterclose.css` | All animation and sign styles (prefixed `sc-*`) |
| `src/core/ShutterClose.ts` | Core class — DOM manipulation, animation, WeakMap registry |
| `src/core/Builder.ts` | Fluent builder (sugar layer over ShutterClose) |
| `src/core/index.ts` | Main entry — wires CSS string, re-exports public API |
| `src/core/no-css.ts` | No-CSS entry — same API, CSS injection disabled |
| `src/react/useShutterClose.ts` | React hook — wraps core instance, syncs `isShut` state |
| `src/react/ShutterClose.tsx` | React component — declarative wrapper over hook |
| `src/react/index.tsx` | React subpath entry |
| `src/vue/useShutterClose.ts` | Vue composable — wraps core instance, reactive `isShut` |
| `src/vue/ShutterClose.vue` | Vue SFC — declarative wrapper over composable |
| `src/vue/index.ts` | Vue subpath entry |
| `tests/core/easing.test.ts` | Unit tests for easing generator |
| `tests/core/css-injector.test.ts` | Unit tests for CSS injection dedup |
| `tests/core/ShutterClose.test.ts` | Core class DOM/animation tests |
| `tests/core/Builder.test.ts` | Fluent builder chain tests |
| `tests/react/useShutterClose.test.tsx` | React hook tests |
| `tests/react/ShutterClose.test.tsx` | React component tests |
| `tests/vue/useShutterClose.test.ts` | Vue composable tests |
| `tests/vue/ShutterClose.test.ts` | Vue component tests |
| `tsup.config.ts` | Build configuration for all formats |
| `tsconfig.json` | TypeScript strict config |
| `vitest.config.ts` | Test runner config with happy-dom |
| `package.json` | Package metadata and subpath exports |
| `.github/workflows/ci.yml` | Test + build on PR |
| `.github/workflows/publish.yml` | Publish to npm on release |
| `.changeset/config.json` | Changesets configuration |
| `README.md` | Full API documentation |

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "shutterclose",
  "version": "0.1.0",
  "description": "Animated roller-shutter effect — covers any HTML element with sliding slats and a customizable closed sign",
  "keywords": ["animation", "shutter", "CSS", "UI", "closed", "react", "vue", "vanilla"],
  "author": "alew140",
  "license": "MIT",
  "repository": { "type": "git", "url": "https://github.com/alew140/shutterclose" },
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./react": {
      "import": "./dist/react/index.esm.js",
      "require": "./dist/react/index.cjs.js",
      "types": "./dist/react/index.d.ts"
    },
    "./vue": {
      "import": "./dist/vue/index.esm.js",
      "require": "./dist/vue/index.cjs.js",
      "types": "./dist/vue/index.d.ts"
    },
    "./no-css": {
      "import": "./dist/no-css.esm.js",
      "require": "./dist/no-css.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./dist/shutterclose.css": "./dist/shutterclose.css"
  },
  "sideEffects": [
    "./dist/index.esm.js",
    "./dist/index.cjs.js",
    "./dist/shutterclose.css"
  ],
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "npm run type-check && npm run test && npm run build"
  },
  "peerDependencies": {
    "react": ">=18",
    "vue": ">=3"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "vue": { "optional": true }
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.0.0",
    "@vue/test-utils": "^2.4.0",
    "happy-dom": "^14.0.0",
    "jsdom": "^25.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tsup": "^8.3.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "vue": "^3.5.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
dist/
*.tsbuildinfo
.DS_Store
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 5: Commit**

```bash
git init
git add package.json tsconfig.json .gitignore
git commit -m "chore: project scaffold"
```

---

## Task 2: Build configuration

**Files:**
- Create: `tsup.config.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup'

export default defineConfig([
  // Core — vanilla JS, all formats
  {
    entry: { index: 'src/core/index.ts' },
    format: ['esm', 'cjs', 'iife'],
    globalName: 'ShutterClose',
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    esbuildOptions(opts) {
      opts.loader = { ...opts.loader, '.css': 'text' }
    },
  },
  // No-CSS variant
  {
    entry: { 'no-css': 'src/core/no-css.ts' },
    format: ['esm', 'cjs'],
    dts: false,
    outDir: 'dist',
    esbuildOptions(opts) {
      opts.loader = { ...opts.loader, '.css': 'text' }
    },
  },
  // Standalone CSS file
  {
    entry: { shutterclose: 'src/core/shutterclose.css' },
    outDir: 'dist',
    loader: { '.css': 'copy' },
  },
  // React wrapper
  {
    entry: { index: 'src/react/index.tsx' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    outDir: 'dist/react',
    external: ['react', 'react/jsx-runtime'],
    esbuildOptions(opts) {
      opts.jsx = 'automatic'
      opts.loader = { ...opts.loader, '.css': 'text' }
    },
  },
  // Vue wrapper
  {
    entry: { index: 'src/vue/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    outDir: 'dist/vue',
    external: ['vue'],
    esbuildOptions(opts) {
      opts.loader = { ...opts.loader, '.css': 'text' }
    },
  },
])
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      thresholds: { lines: 80 },
    },
  },
})
```

- [ ] **Step 3: Verify tsup is callable**

```bash
npx tsup --version
```

Expected: prints version like `8.x.x`.

- [ ] **Step 4: Commit**

```bash
git add tsup.config.ts vitest.config.ts
git commit -m "chore: add build and test configuration"
```

---

## Task 3: Core types

**Files:**
- Create: `src/core/types.ts`

- [ ] **Step 1: Write tests for error class**

Create `tests/core/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { ShutterCloseTargetError } from '../../src/core/types'

describe('ShutterCloseTargetError', () => {
  it('is instance of Error', () => {
    const err = new ShutterCloseTargetError('#missing')
    expect(err).toBeInstanceOf(Error)
  })

  it('has correct name', () => {
    const err = new ShutterCloseTargetError('#missing')
    expect(err.name).toBe('ShutterCloseTargetError')
  })

  it('message includes the target string', () => {
    const err = new ShutterCloseTargetError('#my-panel')
    expect(err.message).toContain('#my-panel')
  })

  it('accepts null target', () => {
    const err = new ShutterCloseTargetError(null)
    expect(err.message).toContain('null')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/core/types.test.ts
```

Expected: FAIL — `ShutterCloseTargetError` not found.

- [ ] **Step 3: Create src/core/types.ts**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/core/types.test.ts
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core/types.ts tests/core/types.test.ts
git commit -m "feat: add core TypeScript types and ShutterCloseTargetError"
```

---

## Task 4: Defaults and easing

**Files:**
- Create: `src/core/defaults.ts`
- Create: `src/core/easing.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/core/easing.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateEasing } from '../../src/core/easing'

describe('generateEasing', () => {
  it('returns a valid cubic-bezier string', () => {
    const result = generateEasing(97)
    expect(result).toMatch(/^cubic-bezier\([\d.,\s]+\)$/)
  })

  it('four numeric values inside cubic-bezier', () => {
    const result = generateEasing(97)
    const match = result.match(/cubic-bezier\(([^)]+)\)/)
    expect(match).not.toBeNull()
    const values = match![1]!.split(',').map(Number)
    expect(values).toHaveLength(4)
    values.forEach(v => expect(isNaN(v)).toBe(false))
  })

  it('higher deceleration produces larger x2 value', () => {
    const low = generateEasing(50)
    const high = generateEasing(99)
    const x2Low = parseFloat(low.match(/cubic-bezier\([^,]+,[^,]+,([^,]+)/)![1]!)
    const x2High = parseFloat(high.match(/cubic-bezier\([^,]+,[^,]+,([^,]+)/)![1]!)
    expect(x2High).toBeGreaterThan(x2Low)
  })

  it('x2 and y2 are clamped within [0,1]', () => {
    [0, 50, 97, 100].forEach(decel => {
      const result = generateEasing(decel)
      const match = result.match(/cubic-bezier\(([^)]+)\)/)!
      const [, , x2, y2] = match[1]!.split(',').map(Number)
      expect(x2).toBeGreaterThanOrEqual(0)
      expect(x2).toBeLessThanOrEqual(1)
      expect(y2).toBeGreaterThanOrEqual(0)
      expect(y2).toBeLessThanOrEqual(1)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/core/easing.test.ts
```

Expected: FAIL — `generateEasing` not found.

- [ ] **Step 3: Create src/core/defaults.ts**

```typescript
import type { ShutterCloseOptions } from './types'

export const DEFAULT_OPTIONS = {
  slats: 8,
  duration: 2,
  heightMultiplier: 3,
  deceleration: 97,
} as const satisfies Required<Pick<ShutterCloseOptions, 'slats' | 'duration' | 'heightMultiplier' | 'deceleration'>>
```

- [ ] **Step 4: Create src/core/easing.ts**

```typescript
export function generateEasing(deceleration: number): string {
  const t = Math.min(1, Math.max(0, deceleration / 100))
  const x2 = Math.min(1, 0.5 + t * 0.4)
  const y2 = t
  return `cubic-bezier(0.100, 0.500, ${x2.toFixed(3)}, ${y2.toFixed(3)})`
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run tests/core/easing.test.ts
```

Expected: PASS — 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/core/defaults.ts src/core/easing.ts tests/core/easing.test.ts
git commit -m "feat: add default options and easing generator"
```

---

## Task 5: CSS injector

**Files:**
- Create: `src/core/css-injector.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/core/css-injector.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setCSSString, injectCSS, STYLE_ID } from '../../src/core/css-injector'

beforeEach(() => {
  document.getElementById(STYLE_ID)?.remove()
  setCSSString('')
})

describe('injectCSS', () => {
  it('does nothing when CSS string is empty', () => {
    injectCSS()
    expect(document.getElementById(STYLE_ID)).toBeNull()
  })

  it('injects a style tag with the CSS content', () => {
    setCSSString('.sc-shutter { display: block; }')
    injectCSS()
    const el = document.getElementById(STYLE_ID)
    expect(el).not.toBeNull()
    expect(el?.tagName).toBe('STYLE')
    expect(el?.textContent).toContain('.sc-shutter')
  })

  it('does not inject twice when called multiple times', () => {
    setCSSString('.sc-shutter { display: block; }')
    injectCSS()
    injectCSS()
    injectCSS()
    const tags = document.querySelectorAll(`#${STYLE_ID}`)
    expect(tags.length).toBe(1)
  })

  it('injects into document.head', () => {
    setCSSString('.sc-shutter { display: block; }')
    injectCSS()
    const el = document.head.querySelector(`#${STYLE_ID}`)
    expect(el).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/core/css-injector.test.ts
```

Expected: FAIL — `setCSSString`, `injectCSS`, `STYLE_ID` not found.

- [ ] **Step 3: Create src/core/css-injector.ts**

```typescript
export const STYLE_ID = 'shutterclose-css'

let _cssString = ''

export function setCSSString(css: string): void {
  _cssString = css
}

export function injectCSS(): void {
  if (!_cssString) return
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = _cssString
  document.head.appendChild(style)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/core/css-injector.test.ts
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/core/css-injector.ts tests/core/css-injector.test.ts
git commit -m "feat: add dedup-safe CSS injector"
```

---

## Task 6: Styles

**Files:**
- Create: `src/core/shutterclose.css`

- [ ] **Step 1: Create src/core/shutterclose.css**

All classes use `sc-` prefix to avoid collisions.

```css
/* ShutterClose.js styles — auto-injected, deduplicated */

.sc-shutter {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  overflow: hidden;
  border-radius: inherit;
}

.sc-shutter.sc-active {
  opacity: 1;
  pointer-events: all;
}

.sc-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateY(var(--sc-start-y, -300%));
  opacity: 0;
  visibility: hidden;
}

.sc-shutter.sc-active .sc-panel {
  animation: sc-panel-slide var(--sc-duration, 2s) var(--sc-easing, cubic-bezier(0.1, 0.5, 0.888, 0.97)) forwards;
}

@keyframes sc-panel-slide {
  0% {
    transform: translateY(var(--sc-start-y, -300%));
    opacity: 0;
    visibility: hidden;
  }
  0.1% {
    opacity: 1;
    visibility: visible;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
}

.sc-slat {
  position: absolute;
  left: 0;
  width: 100%;
  background: linear-gradient(
    180deg,
    #3d4f6f 0%,
    #2a3a52 15%,
    #4a5d7a 30%,
    #1e2d42 45%,
    #3d4f6f 60%,
    #253447 75%,
    #3d4f6f 100%
  );
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Sign */
.sc-sign {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  z-index: 20;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 16px;
  padding: 24px 32px;
  text-align: center;
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow:
    0 20px 60px rgba(238, 90, 36, 0.4),
    0 0 0 4px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  min-width: 200px;
  pointer-events: none;
}

.sc-shutter.sc-active .sc-sign.sc-sign--show {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

/* Theme variants */
.sc-sign--blue   { background: linear-gradient(135deg, #4a9eff 0%, #1a5fb4 100%); box-shadow: 0 20px 60px rgba(26, 95, 180, 0.4), 0 0 0 4px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2); }
.sc-sign--green  { background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 20px 60px rgba(5, 150, 105, 0.4), 0 0 0 4px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2); }
.sc-sign--purple { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); box-shadow: 0 20px 60px rgba(124, 58, 237, 0.4), 0 0 0 4px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2); }
.sc-sign--gold   { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); box-shadow: 0 20px 60px rgba(217, 119, 6, 0.4), 0 0 0 4px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2); }
.sc-sign--red    { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); box-shadow: 0 20px 60px rgba(220, 38, 38, 0.4), 0 0 0 4px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2); }

.sc-sign-icon     { font-size: 48px; margin-bottom: 12px; display: block; line-height: 1; }
.sc-sign-title    { color: #fff; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; font-family: system-ui, -apple-system, sans-serif; }
.sc-sign-subtitle { color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; letter-spacing: 1px; font-family: system-ui, -apple-system, sans-serif; }
```

- [ ] **Step 2: Commit**

```bash
git add src/core/shutterclose.css
git commit -m "feat: add animation and sign styles with sc- prefix"
```

---

## Task 7: Core ShutterClose class

**Files:**
- Create: `src/core/ShutterClose.ts`
- Test: `tests/core/ShutterClose.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/core/ShutterClose.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ShutterClose } from '../../src/core/ShutterClose'
import { ShutterCloseTargetError } from '../../src/core/types'

beforeEach(() => {
  document.body.innerHTML = ''
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function makePanel() {
  const el = document.createElement('div')
  el.id = 'panel'
  el.style.position = 'relative'
  document.body.appendChild(el)
  return el
}

describe('ShutterClose — constructor', () => {
  it('throws ShutterCloseTargetError for missing selector', () => {
    expect(() => new ShutterClose('#nonexistent')).toThrow(ShutterCloseTargetError)
  })

  it('accepts a CSS selector string', () => {
    makePanel()
    expect(() => new ShutterClose('#panel')).not.toThrow()
  })

  it('accepts an HTMLElement directly', () => {
    const el = makePanel()
    expect(() => new ShutterClose(el)).not.toThrow()
  })

  it('destroys previous instance on same element', () => {
    const el = makePanel()
    const first = new ShutterClose(el)
    const destroySpy = vi.spyOn(first, 'destroy')
    new ShutterClose(el)
    expect(destroySpy).toHaveBeenCalledOnce()
  })
})

describe('ShutterClose — close()', () => {
  it('appends sc-shutter element to target', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1, sign: { title: 'TEST' } })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(el.querySelector('.sc-shutter')).not.toBeNull()
  })

  it('creates correct number of slats', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { slats: 5, duration: 0.1 })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    const slats = el.querySelectorAll('.sc-slat')
    expect(slats.length).toBe(5)
  })

  it('sets isShut to true after close', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    expect(sc.isShut).toBe(false)
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(sc.isShut).toBe(true)
  })

  it('calls onClose callback', async () => {
    const el = makePanel()
    const onClose = vi.fn()
    const sc = new ShutterClose(el, { duration: 0.1, onClose })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calling close twice is a no-op', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    const p1 = sc.close()
    vi.advanceTimersByTime(500)
    await p1
    const p2 = sc.close()
    vi.advanceTimersByTime(500)
    await p2
    expect(el.querySelectorAll('.sc-shutter').length).toBe(1)
  })
})

describe('ShutterClose — open()', () => {
  it('removes sc-shutter element', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    const openPromise = sc.open()
    vi.advanceTimersByTime(500)
    await openPromise
    expect(el.querySelector('.sc-shutter')).toBeNull()
  })

  it('sets isShut to false after open', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    const openPromise = sc.open()
    vi.advanceTimersByTime(500)
    await openPromise
    expect(sc.isShut).toBe(false)
  })

  it('calls onOpen callback', async () => {
    const el = makePanel()
    const onOpen = vi.fn()
    const sc = new ShutterClose(el, { duration: 0.1, onOpen })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    const openPromise = sc.open()
    vi.advanceTimersByTime(500)
    await openPromise
    expect(onOpen).toHaveBeenCalledOnce()
  })
})

describe('ShutterClose — static API', () => {
  it('ShutterClose.configure sets global defaults', async () => {
    ShutterClose.configure({ defaults: { slats: 12 } })
    const el = makePanel()
    const sc = new ShutterClose(el, { duration: 0.1 })
    const closePromise = sc.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(el.querySelectorAll('.sc-slat').length).toBe(12)
    ShutterClose.configure({ defaults: {} }) // reset
  })

  it('ShutterClose.target returns a builder', () => {
    const el = makePanel()
    const builder = ShutterClose.target(el)
    expect(typeof builder.slats).toBe('function')
    expect(typeof builder.close).toBe('function')
  })
})

describe('ShutterClose — sign', () => {
  it('renders sign element with correct title', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, {
      duration: 0.1,
      sign: { title: 'CERRADO', icon: '🔒', subtitle: 'Vuelvo pronto' },
    })
    const closePromise = sc.close()
    vi.advanceTimersByTime(2000)
    await closePromise
    const title = el.querySelector('.sc-sign-title')
    expect(title?.textContent).toBe('CERRADO')
    const icon = el.querySelector('.sc-sign-icon')
    expect(icon?.textContent).toBe('🔒')
    const sub = el.querySelector('.sc-sign-subtitle')
    expect(sub?.textContent).toBe('Vuelvo pronto')
  })

  it('applies theme class to sign', async () => {
    const el = makePanel()
    const sc = new ShutterClose(el, {
      duration: 0.1,
      sign: { title: 'TEST', theme: 'blue' },
    })
    const closePromise = sc.close()
    vi.advanceTimersByTime(2000)
    await closePromise
    expect(el.querySelector('.sc-sign--blue')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/core/ShutterClose.test.ts
```

Expected: FAIL — `ShutterClose` not found.

- [ ] **Step 3: Create src/core/ShutterClose.ts**

```typescript
import type { Target, ShutterCloseOptions, GlobalConfig, SignConfig } from './types'
import { ShutterCloseTargetError } from './types'
import { DEFAULT_OPTIONS } from './defaults'
import { generateEasing } from './easing'
import { injectCSS } from './css-injector'
import type { ShutterCloseBuilder } from './Builder'

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

function mergeOpts(opts?: ShutterCloseOptions): ShutterCloseOptions {
  return { ...DEFAULT_OPTIONS, ...globalConfig.defaults, ...opts }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class ShutterClose {
  private readonly el: Element
  private opts: ShutterCloseOptions
  private shutterEl: HTMLElement | null = null
  private _isShut = false

  static configure(config: GlobalConfig): void {
    globalConfig = {
      injectCSS: config.injectCSS ?? globalConfig.injectCSS,
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

  static target(target: Target): ShutterCloseBuilder {
    // Lazy import to avoid circular — Builder imports ShutterClose
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ShutterCloseBuilder } = require('./Builder') as typeof import('./Builder')
    return new ShutterCloseBuilder(target)
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
    registry.delete(this.el)
  }

  get isShut(): boolean {
    return this._isShut
  }
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/core/ShutterClose.test.ts
```

Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/core/ShutterClose.ts tests/core/ShutterClose.test.ts
git commit -m "feat: implement ShutterClose core class with animation and registry"
```

---

## Task 8: Fluent Builder

**Files:**
- Create: `src/core/Builder.ts`
- Test: `tests/core/Builder.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/core/Builder.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ShutterCloseBuilder } from '../../src/core/Builder'

beforeEach(() => {
  document.body.innerHTML = '<div id="panel" style="position:relative"></div>'
  vi.useFakeTimers()
})

afterEach(() => vi.useRealTimers())

describe('ShutterCloseBuilder', () => {
  it('is chainable — each setter returns this', () => {
    const el = document.getElementById('panel')!
    const builder = new ShutterCloseBuilder(el)
    expect(builder.slats(5)).toBe(builder)
    expect(builder.duration(1)).toBe(builder)
    expect(builder.theme('blue')).toBe(builder)
    expect(builder.sign({ title: 'TEST' })).toBe(builder)
    expect(builder.onClose(() => {})).toBe(builder)
    expect(builder.onOpen(() => {})).toBe(builder)
  })

  it('close() triggers animation on target element', async () => {
    const el = document.getElementById('panel')!
    const builder = new ShutterCloseBuilder(el)
    builder.slats(4).duration(0.1)
    const closePromise = builder.close()
    vi.advanceTimersByTime(500)
    await closePromise
    expect(el.querySelector('.sc-shutter')).not.toBeNull()
    expect(el.querySelectorAll('.sc-slat').length).toBe(4)
  })

  it('theme() sets sign theme without requiring title', () => {
    const el = document.getElementById('panel')!
    const builder = new ShutterCloseBuilder(el)
    builder.theme('gold')
    // theme stored internally — will be applied when sign is set
    expect(() => builder.sign({ title: 'TEST' })).not.toThrow()
  })

  it('full chain produces correct DOM', async () => {
    const el = document.getElementById('panel')!
    const builder = new ShutterCloseBuilder(el)
    const closePromise = builder
      .slats(3)
      .duration(0.1)
      .sign({ icon: '🔒', title: 'LOCKED', theme: 'blue' })
      .close()
    vi.advanceTimersByTime(2000)
    await closePromise
    expect(el.querySelectorAll('.sc-slat').length).toBe(3)
    expect(el.querySelector('.sc-sign--blue')).not.toBeNull()
    expect(el.querySelector('.sc-sign-title')?.textContent).toBe('LOCKED')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/core/Builder.test.ts
```

Expected: FAIL — `ShutterCloseBuilder` not found.

- [ ] **Step 3: Create src/core/Builder.ts**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/core/Builder.test.ts
```

Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/core/Builder.ts tests/core/Builder.test.ts
git commit -m "feat: implement fluent ShutterCloseBuilder"
```

---

## Task 9: Core entry points

**Files:**
- Create: `src/core/index.ts`
- Create: `src/core/no-css.ts`

- [ ] **Step 1: Create src/core/index.ts**

This entry wires up the CSS string so auto-injection works.

```typescript
import css from './shutterclose.css'
import { setCSSString } from './css-injector'

setCSSString(css)

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
```

- [ ] **Step 2: Create src/core/no-css.ts**

This entry exposes the same API but never injects CSS.

```typescript
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
```

- [ ] **Step 3: Run full core test suite**

```bash
npx vitest run tests/core/
```

Expected: all tests PASS.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/core/index.ts src/core/no-css.ts
git commit -m "feat: add core entry points (main + no-css)"
```

---

## Task 10: React hook

**Files:**
- Create: `src/react/useShutterClose.ts`
- Test: `tests/react/useShutterClose.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/react/useShutterClose.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRef } from 'react'
import { useShutterClose } from '../../src/react/useShutterClose'

beforeEach(() => {
  document.body.innerHTML = '<div id="target" style="position:relative"></div>'
  vi.useFakeTimers()
})

afterEach(() => vi.useRealTimers())

function setup() {
  const el = document.getElementById('target') as HTMLElement
  return renderHook(() => {
    const ref = useRef<HTMLElement>(el)
    return useShutterClose(ref, { duration: 0.1 })
  })
}

describe('useShutterClose', () => {
  it('returns close, open, toggle, isShut', () => {
    const { result } = setup()
    expect(typeof result.current.close).toBe('function')
    expect(typeof result.current.open).toBe('function')
    expect(typeof result.current.toggle).toBe('function')
    expect(result.current.isShut).toBe(false)
  })

  it('isShut becomes true after close()', async () => {
    const { result } = setup()
    act(() => { result.current.close() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(result.current.isShut).toBe(true)
  })

  it('isShut becomes false after open()', async () => {
    const { result } = setup()
    act(() => { result.current.close() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    act(() => { result.current.open() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(result.current.isShut).toBe(false)
  })

  it('toggle() closes when open', async () => {
    const { result } = setup()
    act(() => { result.current.toggle() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(result.current.isShut).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/react/useShutterClose.test.tsx
```

Expected: FAIL — `useShutterClose` not found.

- [ ] **Step 3: Create src/react/useShutterClose.ts**

```typescript
import { useRef, useState, useCallback, useEffect } from 'react'
import { ShutterClose } from '../core/ShutterClose'
import type { ShutterCloseOptions } from '../core/types'

export function useShutterClose(
  ref: React.RefObject<HTMLElement | null>,
  options?: ShutterCloseOptions,
) {
  const [isShut, setIsShut] = useState(false)
  const instanceRef = useRef<ShutterClose | null>(null)
  const optsRef = useRef(options)
  optsRef.current = options

  const close = useCallback(async () => {
    if (!ref.current) return
    const instance = new ShutterClose(ref.current, {
      ...optsRef.current,
      onClose: () => {
        setIsShut(true)
        optsRef.current?.onClose?.()
      },
    })
    instanceRef.current = instance
    await instance.close()
  }, [ref])

  const open = useCallback(async () => {
    if (!instanceRef.current) return
    await instanceRef.current.open()
    setIsShut(false)
    optsRef.current?.onOpen?.()
  }, [])

  const toggle = useCallback(
    () => (isShut ? open() : close()),
    [isShut, open, close],
  )

  useEffect(() => () => { instanceRef.current?.destroy() }, [])

  return { close, open, toggle, isShut }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/react/useShutterClose.test.tsx
```

Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/react/useShutterClose.ts tests/react/useShutterClose.test.tsx
git commit -m "feat: implement useShutterClose React hook"
```

---

## Task 11: React component

**Files:**
- Create: `src/react/ShutterClose.tsx`
- Test: `tests/react/ShutterClose.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/react/ShutterClose.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import React, { useState } from 'react'
import { ShutterClose } from '../../src/react/ShutterClose'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('ShutterClose React component', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ShutterClose><p>Hello</p></ShutterClose>
    )
    expect(getByText('Hello')).not.toBeNull()
  })

  it('renders a div wrapper', () => {
    const { container } = render(
      <ShutterClose><span>Hi</span></ShutterClose>
    )
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('applies className prop', () => {
    const { container } = render(
      <ShutterClose className="my-panel"><span /></ShutterClose>
    )
    expect((container.firstChild as HTMLElement).className).toContain('my-panel')
  })

  it('triggers close animation when isShut changes to true', async () => {
    function Wrapper() {
      const [shut, setShut] = useState(false)
      return (
        <>
          <button onClick={() => setShut(true)}>Close</button>
          <ShutterClose isShut={shut} duration={0.1}><span>Content</span></ShutterClose>
        </>
      )
    }
    const { container, getByText } = render(<Wrapper />)
    act(() => { getByText('Close').click() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(container.querySelector('.sc-shutter')).not.toBeNull()
  })

  it('calls onClosed callback', async () => {
    const onClosed = vi.fn()
    function Wrapper() {
      const [shut, setShut] = useState(false)
      return (
        <>
          <button onClick={() => setShut(true)}>Close</button>
          <ShutterClose isShut={shut} duration={0.1} onClosed={onClosed}><span /></ShutterClose>
        </>
      )
    }
    const { getByText } = render(<Wrapper />)
    act(() => { getByText('Close').click() })
    act(() => { vi.advanceTimersByTime(500) })
    await act(async () => {})
    expect(onClosed).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/react/ShutterClose.test.tsx
```

Expected: FAIL — `ShutterClose` component not found.

- [ ] **Step 3: Create src/react/ShutterClose.tsx**

```tsx
import React, { useRef, useEffect, CSSProperties } from 'react'
import { useShutterClose } from './useShutterClose'
import type { ShutterCloseOptions } from '../core/types'

export interface ShutterCloseProps extends ShutterCloseOptions {
  children: React.ReactNode
  isShut?: boolean
  onClosed?: () => void
  onOpened?: () => void
  className?: string
  style?: CSSProperties
}

export function ShutterClose({
  children,
  isShut: isShutProp = false,
  onClosed,
  onOpened,
  className,
  style,
  ...opts
}: ShutterCloseProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const { close, open } = useShutterClose(
    ref as React.RefObject<HTMLElement>,
    { ...opts, onClose: onClosed, onOpen: onOpened },
  )

  const prevRef = useRef(isShutProp)
  useEffect(() => {
    if (isShutProp === prevRef.current) return
    prevRef.current = isShutProp
    if (isShutProp) void close()
    else void open()
  }, [isShutProp, close, open])

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/react/ShutterClose.test.tsx
```

Expected: PASS — all tests green.

- [ ] **Step 5: Create src/react/index.tsx**

```typescript
export { ShutterClose } from './ShutterClose'
export type { ShutterCloseProps } from './ShutterClose'
export { useShutterClose } from './useShutterClose'
```

- [ ] **Step 6: Commit**

```bash
git add src/react/ tests/react/ShutterClose.test.tsx
git commit -m "feat: implement React component and entry point"
```

---

## Task 12: Vue composable

**Files:**
- Create: `src/vue/useShutterClose.ts`
- Test: `tests/vue/useShutterClose.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/vue/useShutterClose.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useShutterClose } from '../../src/vue/useShutterClose'

beforeEach(() => {
  document.body.innerHTML = '<div id="target" style="position:relative"></div>'
  vi.useFakeTimers()
})

afterEach(() => vi.useRealTimers())

describe('useShutterClose Vue composable', () => {
  it('returns close, open, toggle, isShut', () => {
    const el = ref(document.getElementById('target') as HTMLElement)
    const { close, open, toggle, isShut } = useShutterClose(el, { duration: 0.1 })
    expect(typeof close).toBe('function')
    expect(typeof open).toBe('function')
    expect(typeof toggle).toBe('function')
    expect(isShut.value).toBe(false)
  })

  it('isShut.value becomes true after close()', async () => {
    const el = ref(document.getElementById('target') as HTMLElement)
    const { close, isShut } = useShutterClose(el, { duration: 0.1 })
    const p = close()
    vi.advanceTimersByTime(500)
    await p
    expect(isShut.value).toBe(true)
  })

  it('isShut.value becomes false after open()', async () => {
    const el = ref(document.getElementById('target') as HTMLElement)
    const { close, open, isShut } = useShutterClose(el, { duration: 0.1 })
    const p1 = close()
    vi.advanceTimersByTime(500)
    await p1
    const p2 = open()
    vi.advanceTimersByTime(500)
    await p2
    expect(isShut.value).toBe(false)
  })

  it('toggle() closes when open', async () => {
    const el = ref(document.getElementById('target') as HTMLElement)
    const { toggle, isShut } = useShutterClose(el, { duration: 0.1 })
    const p = toggle()
    vi.advanceTimersByTime(500)
    await p
    expect(isShut.value).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/vue/useShutterClose.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create src/vue/useShutterClose.ts**

```typescript
import { ref, readonly, toValue, onUnmounted, type Ref, type MaybeRefOrGetter } from 'vue'
import { ShutterClose as SC } from '../core/ShutterClose'
import type { ShutterCloseOptions } from '../core/types'

export function useShutterClose(
  el: Ref<HTMLElement | null>,
  options?: MaybeRefOrGetter<ShutterCloseOptions>,
) {
  const isShut = ref(false)
  let instance: SC | null = null

  function getOpts(): ShutterCloseOptions {
    return toValue(options) ?? {}
  }

  async function close(): Promise<void> {
    if (!el.value) return
    const opts = getOpts()
    instance = new SC(el.value, {
      ...opts,
      onClose: () => {
        isShut.value = true
        opts.onClose?.()
      },
    })
    await instance.close()
  }

  async function open(): Promise<void> {
    if (!instance) return
    await instance.open()
    isShut.value = false
    getOpts().onOpen?.()
  }

  function toggle(): Promise<void> {
    return isShut.value ? open() : close()
  }

  onUnmounted(() => instance?.destroy())

  return { close, open, toggle, isShut: readonly(isShut) }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/vue/useShutterClose.test.ts
```

Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/vue/useShutterClose.ts tests/vue/useShutterClose.test.ts
git commit -m "feat: implement useShutterClose Vue composable"
```

---

## Task 13: Vue component

**Files:**
- Create: `src/vue/ShutterClose.vue`
- Create: `src/vue/index.ts`
- Test: `tests/vue/ShutterClose.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/vue/ShutterClose.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import ShutterCloseVue from '../../src/vue/ShutterClose.vue'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('ShutterClose Vue component', () => {
  it('renders slot content', () => {
    const wrapper = mount(ShutterCloseVue, {
      slots: { default: '<p>Hello Vue</p>' },
    })
    expect(wrapper.text()).toContain('Hello Vue')
  })

  it('wraps content in a div', () => {
    const wrapper = mount(ShutterCloseVue, {
      slots: { default: '<span />' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('triggers close when isShut prop becomes true', async () => {
    const isShut = ref(false)
    const wrapper = mount(ShutterCloseVue, {
      props: { isShut: false, duration: 0.1 },
      slots: { default: '<span />' },
    })
    await wrapper.setProps({ isShut: true })
    vi.advanceTimersByTime(500)
    await vi.runAllTimersAsync()
    expect(wrapper.element.querySelector('.sc-shutter')).not.toBeNull()
  })

  it('emits closed event after animation', async () => {
    const wrapper = mount(ShutterCloseVue, {
      props: { isShut: false, duration: 0.1 },
      slots: { default: '<span />' },
    })
    await wrapper.setProps({ isShut: true })
    vi.advanceTimersByTime(500)
    await vi.runAllTimersAsync()
    expect(wrapper.emitted('closed')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/vue/ShutterClose.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create src/vue/ShutterClose.vue**

```vue
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
```

- [ ] **Step 4: Create src/vue/index.ts**

```typescript
export { default as ShutterClose } from './ShutterClose.vue'
export { useShutterClose } from './useShutterClose'
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```

Expected: all suites PASS.

- [ ] **Step 6: Commit**

```bash
git add src/vue/ tests/vue/ShutterClose.test.ts
git commit -m "feat: implement Vue SFC component and entry point"
```

---

## Task 14: Build and verify distribution

**Files:**
- Modify: `package.json` (verify exports are wired correctly)

- [ ] **Step 1: Run the build**

```bash
npm run build
```

Expected: `dist/` created with no errors. Should contain:
- `dist/index.esm.js`, `dist/index.cjs.js`, `dist/index.iife.js`
- `dist/index.d.ts`
- `dist/no-css.esm.js`, `dist/no-css.cjs.js`
- `dist/shutterclose.css`
- `dist/react/index.esm.js`, `dist/react/index.cjs.js`, `dist/react/index.d.ts`
- `dist/vue/index.esm.js`, `dist/vue/index.cjs.js`, `dist/vue/index.d.ts`

- [ ] **Step 2: Verify exports resolve correctly**

```bash
node -e "const sc = require('./dist/index.cjs.js'); console.log(typeof sc.ShutterClose)"
```

Expected: `function`

- [ ] **Step 3: Verify TypeScript types**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Check bundle size (informational)**

```bash
ls -lh dist/index.esm.js dist/shutterclose.css
```

Expected: core JS well under 10KB, CSS under 3KB.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "build: verify distribution output for all subpath exports"
```

---

## Task 15: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test (Node ${{ matrix.node }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: ['20', '22']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm run type-check
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions CI workflow"
```

---

## Task 16: Changesets + publish workflow

**Files:**
- Create: `.github/workflows/publish.yml`
- Create: `.changeset/config.json`

- [ ] **Step 1: Initialize changesets**

```bash
npx changeset init
```

Expected: `.changeset/config.json` created.

- [ ] **Step 2: Edit .changeset/config.json**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

- [ ] **Step 3: Create publish workflow**

Create `.github/workflows/publish.yml`:

```yaml
name: Publish

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  publish:
    name: Publish to npm
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run type-check
      - run: npm test
      - run: npm run build
      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: npx changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 4: Commit**

```bash
git add .changeset/ .github/workflows/publish.yml
git commit -m "ci: add changesets and npm publish workflow"
```

---

## Task 17: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# shutterclose

> Animated roller-shutter effect for any HTML element. Covers it with sliding metallic slats, then reveals a customizable "closed" sign.

[![npm](https://img.shields.io/npm/v/shutterclose)](https://www.npmjs.com/package/shutterclose)
[![CI](https://github.com/alew140/shutterclose/actions/workflows/ci.yml/badge.svg)](https://github.com/alew140/shutterclose/actions)
[![license](https://img.shields.io/npm/l/shutterclose)](LICENSE)

## Install

```bash
npm install shutterclose
```

## Quick start — Vanilla JS

```js
import ShutterClose from 'shutterclose'

// Fluent API
await ShutterClose
  .target('#my-panel')
  .slats(8)
  .duration(1.5)
  .theme('blue')
  .sign({ icon: '🔒', title: 'CLOSED', subtitle: 'Be back soon' })
  .close()

// Options object
const sc = new ShutterClose('#my-panel', {
  slats: 8,
  duration: 1.5,
  sign: { icon: '🔒', title: 'CLOSED', theme: 'blue' },
})
await sc.close()
await sc.open()
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `slats` | `number` | `8` | Number of horizontal slat strips |
| `duration` | `number` | `2` | Animation duration in seconds |
| `heightMultiplier` | `number` | `3` | How far above the slats start (× element height) |
| `deceleration` | `number` | `97` | % deceleration — higher = more dramatic slow-down |
| `easing` | `string` | auto | Override CSS cubic-bezier string |
| `sign` | `SignConfig` | — | Sign to show after shutters close |
| `onClose` | `() => void` | — | Callback after close animation |
| `onOpen` | `() => void` | — | Callback after open |

### SignConfig

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Text in all-caps (required) |
| `icon` | `string` | Emoji or text icon above title |
| `subtitle` | `string` | Smaller text below title |
| `theme` | `Theme` | Color theme: `default` · `blue` · `green` · `purple` · `gold` · `red` |

## Global config

```js
ShutterClose.configure({
  injectCSS: true,       // auto-inject styles (default: true)
  defaults: { slats: 6, duration: 1.5 },  // apply to all instances
})
```

## CSS

CSS is auto-injected by default. For manual control:

```js
// No auto-inject
import ShutterClose from 'shutterclose/no-css'
import 'shutterclose/dist/shutterclose.css'
```

## React

```tsx
import { ShutterClose, useShutterClose } from 'shutterclose/react'

// Component — controlled via isShut prop
<ShutterClose
  isShut={isLocked}
  slats={8}
  theme="blue"
  sign={{ icon: '🔒', title: 'LOCKED' }}
  onClosed={() => console.log('shut!')}
>
  <YourContent />
</ShutterClose>

// Hook — programmatic control
const { close, open, toggle, isShut } = useShutterClose(ref, { slats: 8 })
```

## Vue

```vue
<script setup>
import { ShutterClose, useShutterClose } from 'shutterclose/vue'
import { ref } from 'vue'

// Composable — programmatic control
const el = ref(null)
const { close, open, toggle, isShut } = useShutterClose(el, { slats: 8 })
</script>

<template>
  <!-- Component — controlled via :is-shut prop -->
  <ShutterClose
    :is-shut="locked"
    :slats="8"
    theme="blue"
    :sign="{ icon: '🔒', title: 'LOCKED' }"
    @closed="onClosed"
  >
    <YourContent />
  </ShutterClose>
</template>
```

## CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/shutterclose/dist/shutterclose.css">
<script src="https://cdn.jsdelivr.net/npm/shutterclose/dist/index.iife.js"></script>
<script>
  ShutterClose.target('#panel').theme('gold').sign({ title: 'CLOSED' }).close()
</script>
```

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README with all API examples"
```

---

## Task 18: Create first changeset and publish

- [ ] **Step 1: Create initial changeset**

```bash
npx changeset
```

Select: major/minor/patch → `minor`  
Message: `Initial release — vanilla, React, and Vue roller-shutter animation library`

- [ ] **Step 2: Version the package**

```bash
npx changeset version
```

Expected: `package.json` version bumped, `CHANGELOG.md` generated.

- [ ] **Step 3: Final preflight check**

```bash
npm run type-check && npm test && npm run build
```

Expected: all pass.

- [ ] **Step 4: Publish to npm**

```bash
npm publish --access public
```

Expected: `+ shutterclose@0.1.0` — package live on npm.

- [ ] **Step 5: Commit release**

```bash
git add -A
git commit -m "release: shutterclose v0.1.0"
git tag v0.1.0
git push origin main --tags
```
```
