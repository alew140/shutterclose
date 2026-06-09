<div align="center">

# shutterclose

**An animated roller-shutter effect for any HTML element.**

```
┌─────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← slat 1
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← slat 2
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← slat 3
│         ┌────────┐          │
│         │ CLOSED │          │  ← sign
│         └────────┘          │
└─────────────────────────────┘
```

[![npm version](https://img.shields.io/npm/v/shutterclose.svg)](https://www.npmjs.com/package/shutterclose)
[![bundle size](https://img.shields.io/bundlephobia/minzip/shutterclose.svg?label=core%20gzip)](https://bundlephobia.com/package/shutterclose)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/shutterclose.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/alew140/shutterclose/ci.yml?label=CI)](https://github.com/alew140/shutterclose/actions)

</div>

shutterclose covers any HTML element with smooth sliding slats and an optional customizable sign. Use it for modal overlays, content restrictions, maintenance screens, and creative UI moments. Ships with vanilla, React, and Vue bindings, full TypeScript types, and zero runtime dependencies.

## Table of Contents

- [Why shutterclose?](#why-shutterclose)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Themes](#themes)
- [API Reference](#api-reference)
  - [Static API](#static-api)
  - [Instance API](#instance-api)
  - [Options](#options)
  - [React](#react)
  - [Vue](#vue)
- [CDN / Browser Usage](#cdn--browser-usage)
- [CSS Control](#css-control)
- [Server-Side Rendering](#server-side-rendering)
- [TypeScript](#typescript)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Why shutterclose?

- **A genuinely unique effect.** Animated, decelerating slats with overshoot give content a physical, mechanical roller-shutter feel that no generic fade or slide reproduces.
- **Zero runtime dependencies.** Pure JavaScript and CSS. Nothing else lands in your `node_modules`.
- **Framework agnostic.** First-class bindings for React and Vue, plus a vanilla API that works anywhere the DOM does.
- **Tiny.** 1.6 KB gzipped for the core, with separate subpath exports so you only ship the binding you use.

## Installation

```bash
npm install shutterclose
```

```bash
pnpm add shutterclose
```

```bash
yarn add shutterclose
```

No build step? Load it straight from a CDN:

```html
<script src="https://unpkg.com/shutterclose/dist/index.global.js"></script>
<link rel="stylesheet" href="https://unpkg.com/shutterclose/dist/shutterclose.css">
```

## Quick Start

### Vanilla

```javascript
import ShutterClose from 'shutterclose'

// Close the element
await ShutterClose.close('.my-element', {
  sign: { title: 'CLOSED', theme: 'red' }
})

// Open it again
await ShutterClose.open('.my-element')
```

### React

```jsx
import { useState } from 'react'
import { ShutterClose } from 'shutterclose/react'

export function Panel() {
  const [shut, setShut] = useState(false)

  return (
    <ShutterClose isShut={shut} sign={{ title: 'CLOSED' }}>
      <p>Content here</p>
      <button onClick={() => setShut(!shut)}>Toggle</button>
    </ShutterClose>
  )
}
```

### Vue

```vue
<script setup>
import { ref } from 'vue'
import { ShutterClose } from 'shutterclose/vue'

const shut = ref(false)
</script>

<template>
  <ShutterClose :is-shut="shut" :sign="{ title: 'CLOSED' }">
    <p>Content here</p>
    <button @click="shut = !shut">Toggle</button>
  </ShutterClose>
</template>
```

## Themes

Six built-in sign themes ship out of the box:

```
🟠 default   🔵 blue   🟢 green
🟣 purple    🟡 gold   🔴 red
```

| Theme | Palette | Suggested Use |
|-------|---------|---------------|
| `default` | orange / amber | General-purpose closed state |
| `blue` | professional blue | Informational overlays |
| `green` | success green | Available / online states |
| `purple` | modern purple | Branded or premium UI |
| `gold` | premium gold | Maintenance, highlights |
| `red` | alert red | Restricted, error, blocked |

Apply a theme through any options object:

```javascript
await ShutterClose.close('.modal', {
  sign: { title: 'CLOSED', theme: 'purple' }
})
```

## API Reference

### Static API

The default export exposes a static surface for one-off calls, global configuration, and a fluent builder.

#### `ShutterClose.close`

```typescript
ShutterClose.close(target: Target, options?: ShutterCloseOptions): Promise<void>
```

Covers the target with the shutter animation. Resolves when the close animation completes.

```javascript
await ShutterClose.close('.modal', {
  slats: 12,
  duration: 1.5,
  sign: { title: 'CLOSED', icon: '🔒', theme: 'red' }
})
```

#### `ShutterClose.open`

```typescript
ShutterClose.open(target: Target): Promise<void>
```

Reveals a previously closed target. Resolves when the open animation completes.

```javascript
await ShutterClose.open('.modal')
```

#### `ShutterClose.target`

```typescript
ShutterClose.target(target: Target): ShutterCloseBuilder
```

Returns a reusable, chainable builder for declarative configuration.

```javascript
const shutter = ShutterClose.target('.panel')
  .slats(16)
  .duration(1.8)
  .sign({ title: 'CLOSED', subtitle: 'Please try again later' })
  .onClose(() => console.log('closed'))
  .onOpen(() => console.log('opened'))

await shutter.close()
await shutter.open()
```

| Method | Description |
|--------|-------------|
| `.slats(count)` | Number of slats (default: 8) |
| `.duration(seconds)` | Animation duration (default: 2) |
| `.heightMultiplier(mult)` | Slat starting-height multiplier (default: 3) |
| `.deceleration(percent)` | Easing deceleration, 0–100 (default: 97) |
| `.easing(curve)` | Custom CSS easing string |
| `.theme(name)` | Built-in sign theme |
| `.sign(config)` | Sign configuration |
| `.onClose(fn)` | Callback after close completes |
| `.onOpen(fn)` | Callback after open completes |
| `.close()` | Execute the close animation |
| `.open()` | Execute the open animation |

#### `ShutterClose.configure`

```typescript
ShutterClose.configure(config: GlobalConfig): void
```

Sets global defaults shared by every instance and static call.

```javascript
ShutterClose.configure({
  injectCSS: true,
  defaults: {
    slats: 10,
    duration: 1.5,
    sign: { title: 'MAINTENANCE' }
  }
})
```

### Instance API

```typescript
new ShutterClose(target: Target, options?: ShutterCloseOptions)
```

Construct an instance for fine-grained, stateful control over a single target.

```javascript
const instance = new ShutterClose('.overlay', {
  slats: 12,
  sign: { title: 'CLOSED' }
})

await instance.close()
console.log(instance.isShut) // true
await instance.open()
instance.destroy()
```

| Member | Signature | Description |
|--------|-----------|-------------|
| `isShut` | `boolean` (read-only) | Whether the target is currently closed |
| `close()` | `() => Promise<void>` | Run the close animation |
| `open()` | `() => Promise<void>` | Run the open animation |
| `destroy()` | `() => void` | Tear down and remove the overlay |

### Options

Every option is optional and merges over the configured global defaults.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `slats` | `number` | `8` | Number of horizontal slats |
| `duration` | `number` | `2` | Animation duration in seconds |
| `heightMultiplier` | `number` | `3` | Slat starting-height multiplier for overshoot |
| `deceleration` | `number` | `97` | Easing deceleration percentage, 0–100 |
| `easing` | `string` | — | Custom CSS easing curve |
| `sign` | `SignConfig` | — | Closed-sign configuration |
| `onClose` | `() => void` | — | Fires after the close animation completes |
| `onOpen` | `() => void` | — | Fires after the open animation completes |

#### SignConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | `string` | Yes | Main text on the sign |
| `subtitle` | `string` | No | Secondary text below the title |
| `icon` | `string` | No | Icon or emoji, e.g. `🔒`, `⚠️` |
| `theme` | `Theme` | No | One of the six built-in themes |

### React

Import bindings from `shutterclose/react`.

#### `useShutterClose`

```typescript
useShutterClose(ref: RefObject<HTMLElement>, options?: ShutterCloseOptions)
```

```jsx
import { useRef } from 'react'
import { useShutterClose } from 'shutterclose/react'

export function Panel() {
  const ref = useRef(null)
  const { close, open, toggle, isShut } = useShutterClose(ref, {
    slats: 12,
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

| Returned | Type | Description |
|----------|------|-------------|
| `close()` | `() => Promise<void>` | Close the shutter |
| `open()` | `() => Promise<void>` | Open the shutter |
| `toggle()` | `() => Promise<void>` | Toggle the current state |
| `isShut` | `boolean` | Current closed state |

#### `<ShutterClose />`

```jsx
import { ShutterClose } from 'shutterclose/react'

<ShutterClose
  isShut={shut}
  slats={12}
  duration={1.5}
  sign={{ title: 'CLOSED', icon: '🔒', theme: 'red' }}
  onClosed={() => console.log('closed')}
  onOpened={() => console.log('opened')}
  className="container"
  style={{ maxWidth: 500 }}
>
  <h1>Content</h1>
</ShutterClose>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isShut` | `boolean` | `false` | Controlled closed state |
| `onClosed` | `() => void` | — | Fires when close completes |
| `onOpened` | `() => void` | — | Fires when open completes |
| `className` | `string` | — | Class for the wrapper element |
| `style` | `CSSProperties` | — | Inline styles for the wrapper |
| _...ShutterCloseOptions_ | — | — | All [Options](#options) are accepted as props |

### Vue

Import bindings from `shutterclose/vue`.

#### `useShutterClose`

```typescript
useShutterClose(el: Ref<HTMLElement | null>, options?: ShutterCloseOptions)
```

```vue
<script setup>
import { ref } from 'vue'
import { useShutterClose } from 'shutterclose/vue'

const el = ref(null)
const { close, open, toggle, isShut } = useShutterClose(el, {
  slats: 12,
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

| Returned | Type | Description |
|----------|------|-------------|
| `close()` | `() => Promise<void>` | Close the shutter |
| `open()` | `() => Promise<void>` | Open the shutter |
| `toggle()` | `() => Promise<void>` | Toggle the current state |
| `isShut` | `Ref<boolean>` | Reactive closed state |

#### `<ShutterClose />`

```vue
<ShutterClose
  :is-shut="shut"
  :slats="12"
  :duration="1.5"
  :sign="{ title: 'CLOSED', icon: '🔒', theme: 'red' }"
  class="container"
  @closed="onClosed"
  @opened="onOpened"
>
  <h1>Content</h1>
</ShutterClose>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isShut` | `boolean` | `false` | Controlled closed state |
| `class` | `string` | — | Class for the wrapper element |
| _...ShutterCloseOptions_ | — | — | All [Options](#options) are accepted as props |

| Event | Description |
|-------|-------------|
| `closed` | Emitted when the close animation completes |
| `opened` | Emitted when the open animation completes |

## CDN / Browser Usage

The IIFE build exposes a global named `ShutterClose`. Drop in two tags and call it directly.

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/shutterclose/dist/shutterclose.css">
  </head>
  <body>
    <main id="app">
      <h1>Welcome</h1>
    </main>

    <script src="https://unpkg.com/shutterclose/dist/index.global.js"></script>
    <script>
      ShutterClose.close('#app', {
        slats: 16,
        duration: 1.5,
        sign: { title: 'CLOSED', theme: 'gold' }
      })
    </script>
  </body>
</html>
```

## CSS Control

By default the core auto-injects its stylesheet into `<head>`, so no extra setup is needed.

```javascript
import ShutterClose from 'shutterclose'
// Styles are injected automatically.
```

For full control over loading order or bundling, use the `no-css` entry and import the stylesheet yourself.

```javascript
import ShutterClose from 'shutterclose/no-css'
import 'shutterclose/shutterclose.css'

ShutterClose.configure({ injectCSS: false })
```

The stylesheet exposes CSS custom properties for theming.

```css
.sc-shutter {
  --sc-duration: 2s;
  --sc-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --sc-start-y: -300%;
}

.sc-slat {
  background: linear-gradient(135deg, #333 0%, #444 100%);
}
```

## Server-Side Rendering

The CSS injector guards on `typeof document === 'undefined'`, so importing shutterclose is safe in SSR environments such as Next.js and Nuxt.

## TypeScript

shutterclose is authored in strict TypeScript and ships complete `.d.ts` declarations for every entry point.

```typescript
import type { ShutterCloseOptions, SignConfig, Theme } from 'shutterclose'
import ShutterClose from 'shutterclose'

const options: ShutterCloseOptions = {
  slats: 10,
  duration: 1.5,
  sign: { title: 'CLOSED', theme: 'red' }
}

await ShutterClose.close('.modal', options)
```

Exported types: `ShutterCloseOptions`, `SignConfig`, `Theme`, `Target`, `GlobalConfig`, and `ShutterCloseTargetError`.

## Error Handling

A `ShutterCloseTargetError` is thrown when a selector matches no element.

```javascript
import ShutterClose, { ShutterCloseTargetError } from 'shutterclose'

try {
  await ShutterClose.close('.does-not-exist')
} catch (err) {
  if (err instanceof ShutterCloseTargetError) {
    console.error('Target not found:', err.message)
  }
}
```

## Contributing

Contributions are welcome. Open an issue or a pull request on [GitHub](https://github.com/alew140/shutterclose). CI runs on Node 18 and 20 via GitHub Actions, and releases are managed with Changesets.

## License

MIT. See [LICENSE](LICENSE) for details.
