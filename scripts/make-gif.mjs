import { createCanvas } from 'canvas'
import GifEncoder from 'gif-encoder-2'
import { createWriteStream, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dir, '..')

const W = 600
const H = 380
const FPS = 25
const FRAME_MS = 1000 / FPS

mkdirSync(resolve(root, 'media'), { recursive: true })

// Cubic bezier easing solver (t → y)
function cubicBezier(p1x, p1y, p2x, p2y) {
  return function ease(t) {
    // Newton-Raphson approximation
    let x = t
    for (let i = 0; i < 8; i++) {
      const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx
      const slope = cx + 2 * bx * x + 3 * ax * x * x
      if (Math.abs(slope) < 1e-6) break
      const xVal = ((ax * x + bx) * x + cx) * x
      x -= (xVal - t) / slope
    }
    const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by
    return ((ay * x + by) * x + cy) * x
  }
}

// Default easing: deceleration 97 → approx ease-out cubic
const ease = cubicBezier(0.25, 0.46, 0.45, 0.94)

const SLATS = 8
const SIGN_TEXT = 'CLOSED'
const SIGN_SUB = 'Come back soon'
const SLAT_H = H / SLATS
const OVERSHOOT = 3 // heightMultiplier

function drawBackground(ctx) {
  // Page background
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, W, H)

  // Simulated web page content
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(20, 20, W - 40, H - 40)

  // Fake nav bar
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(20, 20, W - 40, 44)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText('MyApp', 40, 48)

  // Nav links
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '12px sans-serif'
  ctx.fillText('Home', W - 180, 48)
  ctx.fillText('About', W - 130, 48)
  ctx.fillText('Contact', W - 80, 48)

  // Hero text
  ctx.fillStyle = '#111'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Welcome to MyApp', W / 2, 130)

  ctx.fillStyle = '#666'
  ctx.font = '14px sans-serif'
  ctx.fillText('Your one-stop solution for everything', W / 2, 158)

  // CTA button
  ctx.fillStyle = '#4f46e5'
  roundRect(ctx, W / 2 - 70, 178, 140, 38, 8)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 13px sans-serif'
  ctx.fillText('Get Started', W / 2, 202)

  // Cards
  ctx.textAlign = 'left'
  for (let i = 0; i < 3; i++) {
    const cx = 52 + i * 180
    ctx.fillStyle = '#f8f8f8'
    roundRect(ctx, cx, 248, 150, 90, 6)
    ctx.fill()
    ctx.strokeStyle = '#e2e2e2'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#333'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(['Analytics', 'Reports', 'Settings'][i], cx + 14, 274)
    ctx.fillStyle = '#888'
    ctx.font = '11px sans-serif'
    ctx.fillText('View details →', cx + 14, 310)
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawShutter(ctx, progress) {
  // progress 0 = fully open (slats at top), 1 = fully closed (slats cover element)
  for (let i = 0; i < SLATS; i++) {
    const targetY = i * SLAT_H + 20  // +20 for the page offset
    const startY = 20 - OVERSHOOT * H
    const y = startY + (targetY - startY) * progress

    // Slat shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(20, y + SLAT_H - 2, W - 40, 4)

    // Slat gradient
    const grad = ctx.createLinearGradient(0, y, 0, y + SLAT_H)
    grad.addColorStop(0, '#4a4a4a')
    grad.addColorStop(0.4, '#3a3a3a')
    grad.addColorStop(1, '#2a2a2a')
    ctx.fillStyle = grad
    ctx.fillRect(20, y, W - 40, SLAT_H - 1)

    // Slat highlight
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(20, y, W - 40, 2)
  }
}

function drawSign(ctx, opacity) {
  if (opacity <= 0) return
  const sw = 220, sh = 90
  const sx = (W - sw) / 2, sy = (H - sh) / 2 + 5

  ctx.save()
  ctx.globalAlpha = opacity

  // Sign shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  roundRect(ctx, sx + 4, sy + 4, sw, sh, 10)
  ctx.fill()

  // Sign body (amber / gold)
  const bg = ctx.createLinearGradient(sx, sy, sx, sy + sh)
  bg.addColorStop(0, '#f59e0b')
  bg.addColorStop(1, '#d97706')
  ctx.fillStyle = bg
  roundRect(ctx, sx, sy, sw, sh, 10)
  ctx.fill()

  // Sign border
  ctx.strokeStyle = '#92400e'
  ctx.lineWidth = 2
  roundRect(ctx, sx + 1, sy + 1, sw - 2, sh - 2, 9)
  ctx.stroke()

  // Icon + title
  ctx.fillStyle = '#1c1917'
  ctx.textAlign = 'center'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText('🔒 ' + SIGN_TEXT, sx + sw / 2, sy + 38)

  // Divider
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.fillRect(sx + 20, sy + 50, sw - 40, 1)

  // Subtitle
  ctx.fillStyle = '#44403c'
  ctx.font = '12px sans-serif'
  ctx.fillText(SIGN_SUB, sx + sw / 2, sy + 68)

  ctx.restore()
  ctx.textAlign = 'left'
}

// Timeline (seconds)
const T_OPEN_HOLD = 0.5   // hold open
const T_CLOSE_DUR = 1.4   // close animation
const T_SIGN_DELAY = 0.2  // sign fades in after close
const T_CLOSED_HOLD = 1.0 // hold closed
const T_OPEN_DUR = 0.5    // open animation
const T_END_HOLD = 0.4    // hold open at end
const TOTAL = T_OPEN_HOLD + T_CLOSE_DUR + T_SIGN_DELAY + T_CLOSED_HOLD + T_OPEN_DUR + T_END_HOLD

const totalFrames = Math.ceil(TOTAL * FPS)

const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

const encoder = new GifEncoder(W, H, 'neuquant', true)
const outPath = resolve(root, 'media', 'demo.gif')
const stream = encoder.createReadStream()
stream.pipe(createWriteStream(outPath))

encoder.setDelay(Math.round(FRAME_MS))
encoder.setRepeat(0)
encoder.setQuality(8)
encoder.start()

for (let f = 0; f < totalFrames; f++) {
  const t = f / FPS

  let shutterProgress = 0
  let signOpacity = 0

  if (t < T_OPEN_HOLD) {
    shutterProgress = 0
  } else if (t < T_OPEN_HOLD + T_CLOSE_DUR) {
    const p = (t - T_OPEN_HOLD) / T_CLOSE_DUR
    shutterProgress = ease(p)
  } else if (t < T_OPEN_HOLD + T_CLOSE_DUR + T_SIGN_DELAY) {
    shutterProgress = 1
  } else if (t < T_OPEN_HOLD + T_CLOSE_DUR + T_SIGN_DELAY + T_CLOSED_HOLD) {
    shutterProgress = 1
    const p = (t - T_OPEN_HOLD - T_CLOSE_DUR - T_SIGN_DELAY) / T_CLOSED_HOLD
    signOpacity = Math.min(1, p * 3) // fade in quickly
  } else if (t < T_OPEN_HOLD + T_CLOSE_DUR + T_SIGN_DELAY + T_CLOSED_HOLD + T_OPEN_DUR) {
    const p = (t - T_OPEN_HOLD - T_CLOSE_DUR - T_SIGN_DELAY - T_CLOSED_HOLD) / T_OPEN_DUR
    shutterProgress = 1 - ease(p)
    signOpacity = Math.max(0, 1 - p * 3)
  } else {
    shutterProgress = 0
  }

  drawBackground(ctx)
  if (shutterProgress > 0) drawShutter(ctx, shutterProgress)
  if (signOpacity > 0) drawSign(ctx, signOpacity)

  encoder.addFrame(ctx)
}

encoder.finish()
stream.on('finish', () => {
  console.log(`✓ media/demo.gif — ${totalFrames} frames @ ${FPS}fps`)
  process.exit(0)
})
