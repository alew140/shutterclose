# shutterclose

> Animated roller-shutter effect for any HTML element — zero dependencies, framework agnostic.

[![npm version](https://img.shields.io/npm/v/shutterclose.svg)](https://www.npmjs.com/package/shutterclose)
[![bundle size](https://img.shields.io/bundlephobia/minzip/shutterclose.svg)](https://bundlephobia.com/package/shutterclose)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/shutterclose.svg)](LICENSE)

Covers any HTML element with smooth, animated sliding slats and an optional customizable "CLOSED" sign. Perfect for modal overlays, content restrictions, maintenance pages, and creative UI effects. Includes vanilla JavaScript, React, and Vue integrations—all with full TypeScript support and zero runtime dependencies.

## Features

- **Zero dependencies** — Pure JavaScript, no libraries required
- **Framework-agnostic** — Works with vanilla JS, React, Vue, or any DOM-based framework
- **Fully typed** — TypeScript strict mode, complete `.d.ts` distributions
- **Animated slats** — Smooth easing, configurable count and speed
- **Closed sign** — Optional overlays with custom text, icons, themes, and styling
- **Theme system** — Built-in themes (default, blue, green, purple, gold, red) plus custom CSS
- **CSS injection** — Automatic CSS bundling or use the no-CSS variant for complete control
- **Lightweight** — Sub-5KB minified across all formats (ESM, CJS, IIFE)
- **Multiple formats** — ESM, CommonJS, and browser-ready IIFE
- **Subpath exports** — Separate entry points for vanilla JS, React, and Vue

## Installation

```bash
npm install shutterclose
```

or with your package manager of choice:

```bash
pnpm add shutterclose
yarn add shutterclose
```

## Quick Start

### Vanilla JavaScript

```javascript
import ShutterClose from 'shutterclose'

const element = document.querySelector('.my-element')

// Close with defaults
await ShutterClose.close(element, {
  sign: { title: 'CLOSED' }
})

// Open again
await ShutterClose.open(element)
```

### React

```jsx
import { ShutterClose } from 'shutterclose/react'

export function MyComponent() {
  const [isClosed, setIsClosed] = useState(false)

  return (
    <ShutterClose isShut={isClosed} sign={{ title: 'CLOSED' }}>
      <p>Content here</p>
      <button onClick={() => setIsClosed(!isClosed)}>
        Toggle
      </button>
    </ShutterClose>
  )
}
```

### Vue

```vue
<script setup>
import { ref } from 'vue'
import { ShutterClose } from 'shutterclose/vue'

const isClosed = ref(false)
</script>

<template>
  <ShutterClose :is-shut="isClosed" :sign="{ title: 'CLOSED' }">
    <p>Content here</p>
    <button @click="isClosed = !isClosed">Toggle</button>
  </ShutterClose>
</template>
```

## API

### Vanilla JavaScript

#### `ShutterClose.close(target, options?)`

Close the target element with an animated shutter effect.

```javascript
import ShutterClose from 'shutterclose'

await ShutterClose.close('.modal', {
  slats: 12,
  duration: 1.5,
  sign: { title: 'CLOSED', icon: '🔒' }
})
```

**Parameters:**
- `target` (string | HTMLElement | Element) — CSS selector or DOM element to cover
- `options?` (ShutterCloseOptions) — Configuration object (see Options below)

**Returns:** Promise<void> — resolves when animation completes

---

#### `ShutterClose.open(target)`

Open a previously closed element, removing the shutter overlay.

```javascript
await ShutterClose.open('.modal')
```

**Parameters:**
- `target` (string | HTMLElement | Element) — CSS selector or DOM element to uncover

**Returns:** Promise<void> — resolves when animation completes

---

#### `ShutterClose.target(target)` — Fluent Builder

Create a reusable builder for declarative, chainable configuration.

```javascript
const shutter = ShutterClose.target('.my-element')
  .slats(16)
  .duration(1.8)
  .sign({ title: 'CLOSED', subtitle: 'Please try again later' })
  .onClose(() => console.log('Closed!'))
  .onOpen(() => console.log('Opened!'))

// Trigger multiple times
await shutter.close()
await shutter.open()
await shutter.close()
```

**Chainable methods:**
- `.slats(count: number)` — Set number of slats (default: 8)
- `.duration(seconds: number)` — Set animation duration (default: 2)
- `.heightMultiplier(mult: number)` — Multiplier for starting height (default: 3)
- `.deceleration(percent: number)` — Easing deceleration % (default: 97)
- `.easing(curve: string)` — Custom CSS easing string
- `.theme(name: Theme)` — Built-in theme for sign
- `.sign(config: SignConfig)` — Closed sign configuration
- `.onClose(fn: () => void)` — Callback on close complete
- `.onOpen(fn: () => void)` — Callback on open complete
- `.close()` — Execute close animation
- `.open()` — Execute open animation

---

#### `ShutterClose.configure(config)`

Set global defaults for all instances.

```javascript
ShutterClose.configure({
  injectCSS: true,  // Auto-inject styles (default)
  defaults: {
    slats: 10,
    duration: 1.5,
    sign: { title: 'MAINTENANCE' }
  }
})
```

---

#### `new ShutterClose(target, options?)`

Create a new instance for low-level control.

```javascript
const instance = new ShutterClose('.overlay', {
  slats: 12,
  duration: 2,
  sign: { title: 'CLOSED' }
})

await instance.close()
console.log(instance.isShut)  // true
await instance.open()
instance.destroy()
```

**Properties:**
- `isShut` (boolean, read-only) — Whether element is currently closed

**Methods:**
- `close()` → Promise<void>
- `open()` → Promise<void>
- `destroy()` → void — Cleanup and remove overlay if present

---

### Options

All options are optional and merge with global defaults.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `slats` | number | 8 | Number of horizontal slats in the animation |
| `duration` | number | 2 | Animation duration in seconds |
| `heightMultiplier` | number | 3 | Multiplier for slat starting height (for overshoot effect) |
| `deceleration` | number | 97 | Easing deceleration percentage (0–100) |
| `easing` | string | — | Custom CSS easing curve (e.g., `cubic-bezier(...)`) |
| `sign` | SignConfig | — | Configuration for the "CLOSED" sign overlay |
| `onClose` | () => void | — | Callback when animation completes |
| `onOpen` | () => void | — | Callback when element opens |

#### SignConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | Yes | Main text on the sign |
| `subtitle` | string | No | Secondary text below title |
| `icon` | string | No | Icon or emoji (e.g., `🔒`, `⚠️`) |
| `theme` | Theme | No | Visual theme (see Themes below) |

#### Themes

Built-in themes for the closed sign:

- `default` — Clean, minimal dark background
- `blue` — Professional blue theme
- `green` — Success/available green
- `purple` — Modern purple accent
- `gold` — Premium gold/yellow
- `red` — Alert/restricted red

Apply via options or builder:

```javascript
// Via options
ShutterClose.close('.modal', {
  sign: { title: 'CLOSED', theme: 'red' }
})

// Via builder
ShutterClose.target('.modal')
  .theme('purple')
  .sign({ title: 'CLOSED' })
  .close()
```

---

### React

#### `useShutterClose(ref, options?)`

Hook for managing shutter state in functional components.

```javascript
import { useRef } from 'react'
import { useShutterClose } from 'shutterclose/react'

export function MyComponent() {
  const ref = useRef(null)
  const { close, open, toggle, isShut } = useShutterClose(ref, {
    slats: 12,
    duration: 1.5,
    sign: { title: 'CLOSED', theme: 'red' }
  })

  return (
    <div ref={ref}>
      <p>{isShut ? 'Closed' : 'Open'}</p>
      <button onClick={toggle}>Toggle</button>
    </div>
  )
}
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `close()` | () => Promise<void> | Close the shutter |
| `open()` | () => Promise<void> | Open the shutter |
| `toggle()` | () => Promise<void> | Toggle between open/closed |
| `isShut` | boolean | Current closed state |

---

#### `<ShutterClose />` Component

Declarative React component for shutter state.

```jsx
import { ShutterClose } from 'shutterclose/react'

export function MyComponent() {
  const [isClosed, setIsClosed] = useState(false)

  return (
    <ShutterClose
      isShut={isClosed}
      slats={12}
      duration={1.5}
      sign={{ title: 'CLOSED', icon: '🔒', theme: 'red' }}
      onClosed={() => console.log('Closed!')}
      onOpened={() => console.log('Opened!')}
      className="my-container"
      style={{ maxWidth: '500px' }}
    >
      <h1>Modal Content</h1>
      <button onClick={() => setIsClosed(!isClosed)}>
        {isClosed ? 'Reopen' : 'Close'}
      </button>
    </ShutterClose>
  )
}
```

**Props (extends ShutterCloseOptions):**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | React.ReactNode | — | Content to wrap |
| `isShut` | boolean | false | Controlled closed state |
| `onClosed` | () => void | — | Fires when close animation completes |
| `onOpened` | () => void | — | Fires when open animation completes |
| `className` | string | — | CSS class for wrapper div |
| `style` | CSSProperties | — | Inline styles for wrapper |
| `slats` | number | 8 | Number of slats |
| `duration` | number | 2 | Animation duration (seconds) |
| `heightMultiplier` | number | 3 | Slat starting height multiplier |
| `deceleration` | number | 97 | Easing deceleration (0–100) |
| `easing` | string | — | Custom CSS easing |
| `sign` | SignConfig | — | Closed sign config |
| `onClose` | () => void | — | Callback on close |
| `onOpen` | () => void | — | Callback on open |

---

### Vue

#### `useShutterClose(el, options?)`

Composable for managing shutter state in Vue components.

```vue
<script setup>
import { ref } from 'vue'
import { useShutterClose } from 'shutterclose/vue'

const el = ref(null)
const { close, open, toggle, isShut } = useShutterClose(el, {
  slats: 12,
  duration: 1.5,
  sign: { title: 'CLOSED', theme: 'red' }
})
</script>

<template>
  <div ref="el">
    <p>{{ isShut ? 'Closed' : 'Open' }}</p>
    <button @click="toggle">Toggle</button>
  </div>
</template>
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `close()` | () => Promise<void> | Close the shutter |
| `open()` | () => Promise<void> | Open the shutter |
| `toggle()` | () => Promise<void> | Toggle between open/closed |
| `isShut` | Ref<boolean> | Reactive closed state |

---

#### `<ShutterClose />` Component

Declarative Vue component for shutter state.

```vue
<script setup>
import { ref } from 'vue'
import { ShutterClose } from 'shutterclose/vue'

const isClosed = ref(false)
</script>

<template>
  <ShutterClose
    :is-shut="isClosed"
    :slats="12"
    :duration="1.5"
    :sign="{ title: 'CLOSED', icon: '🔒', theme: 'red' }"
    @closed="console.log('Closed!')"
    @opened="console.log('Opened!')"
    class="my-container"
  >
    <h1>Modal Content</h1>
    <button @click="isClosed = !isClosed">
      {{ isClosed ? 'Reopen' : 'Close' }}
    </button>
  </ShutterClose>
</template>
```

**Props (extends ShutterCloseOptions):**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isShut` | boolean | false | Controlled closed state |
| `class` | string | — | CSS class for wrapper |
| `slats` | number | 8 | Number of slats |
| `duration` | number | 2 | Animation duration (seconds) |
| `heightMultiplier` | number | 3 | Slat starting height multiplier |
| `deceleration` | number | 97 | Easing deceleration (0–100) |
| `easing` | string | — | Custom CSS easing |
| `sign` | SignConfig | — | Closed sign config |
| `onClose` | () => void | — | Callback on close |
| `onOpen` | () => void | — | Callback on open |

**Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `closed` | — | Fires when close animation completes |
| `opened` | — | Fires when open animation completes |

---

## CSS

### Automatic Injection (Default)

By default, shutterclose automatically injects its CSS into the document `<head>`. No additional setup required.

```javascript
import ShutterClose from 'shutterclose'
// CSS is injected automatically
```

### Disable Auto-Injection

Use the `no-css` export to import without CSS injection, then manually include styles:

```javascript
import ShutterClose from 'shutterclose/no-css'
import 'shutterclose/shutterclose.css'

ShutterClose.configure({ injectCSS: false })
```

### Custom Styling

The styles use CSS custom properties for easy customization:

```css
.sc-shutter {
  --sc-duration: 2s;
  --sc-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --sc-start-y: -300%;
}

.sc-slat {
  /* Customize individual slat appearance */
  background: linear-gradient(135deg, #333 0%, #444 100%);
}

.sc-sign {
  /* Customize the closed sign */
  background: rgba(0, 0, 0, 0.95);
  color: #fff;
}
```

---

## TypeScript

shutterclose is written in TypeScript and provides full type definitions for all entry points. Enable strict mode for best results:

```typescript
import type { ShutterCloseOptions, SignConfig, Theme } from 'shutterclose'
import ShutterClose from 'shutterclose'

const options: ShutterCloseOptions = {
  slats: 10,
  duration: 1.5,
  sign: {
    title: 'CLOSED',
    theme: 'red'
  }
}

await ShutterClose.close('.modal', options)
```

All exported types:
- `ShutterCloseOptions` — Configuration object
- `SignConfig` — Closed sign configuration
- `Theme` — Theme type ('default' | 'blue' | 'green' | 'purple' | 'gold' | 'red')
- `Target` — Selector or element type (string | HTMLElement | Element)
- `GlobalConfig` — Global configuration
- `ShutterCloseTargetError` — Error class for invalid targets

---

## Browser Support

shutterclose works on all modern browsers that support:
- ES2015+ JavaScript
- CSS Custom Properties (CSS Variables)
- Web Animations API or `requestAnimationFrame`

**Supported browsers:**
- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+
- iOS Safari 9.3+
- Android Chrome 49+

---

## Error Handling

### ShutterCloseTargetError

Thrown when a target selector does not match any element:

```javascript
try {
  await ShutterClose.close('.non-existent')
} catch (err) {
  if (err instanceof ShutterCloseTargetError) {
    console.error('Target not found:', err.message)
  }
}
```

---

## Examples

### Modal with Shutter Overlay

```jsx
import { useState } from 'react'
import { ShutterClose } from 'shutterclose/react'

export function Modal() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <ShutterClose
      isShut={!isOpen}
      slats={16}
      duration={1.2}
      sign={{
        title: 'MODAL CLOSED',
        icon: '❌',
        theme: 'red'
      }}
      onClosed={() => console.log('Modal closed')}
    >
      <div className="modal-content">
        <h2>Important Notice</h2>
        <p>This is your modal content.</p>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Close' : 'Reopen'}
        </button>
      </div>
    </ShutterClose>
  )
}
```

### Maintenance Page

```javascript
import ShutterClose from 'shutterclose'

ShutterClose.close(document.querySelector('main'), {
  slats: 20,
  duration: 1.5,
  sign: {
    title: 'UNDER MAINTENANCE',
    subtitle: 'We\'ll be back soon',
    icon: '🔧',
    theme: 'gold'
  }
})
```

### Programmatic Control with Fluent Builder

```javascript
const pageShutter = ShutterClose.target('.page-content')
  .slats(12)
  .duration(1.8)
  .sign({ title: 'RESTRICTED', theme: 'red' })
  .onClose(() => {
    console.log('Page is now restricted')
    document.body.style.overflow = 'hidden'
  })
  .onOpen(() => {
    console.log('Page is now accessible')
    document.body.style.overflow = 'auto'
  })

// Restrict access
await pageShutter.close()

// Restore access
await pageShutter.open()
```

---

## Performance

- **Minimal bundle size** — Sub-5KB minified, zero runtime dependencies
- **GPU-accelerated animations** — Uses CSS transforms and `requestAnimationFrame`
- **Efficient DOM management** — Minimal reflows and repaints
- **Memory conscious** — Single element instance per target, automatic cleanup

---

## License

MIT — See [LICENSE](LICENSE) for details.

---

## Contributing

Contributions welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/alew140/shutterclose).
