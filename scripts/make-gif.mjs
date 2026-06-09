import { createCanvas } from 'canvas'
import GifEncoder from 'gif-encoder-2'
import { createWriteStream, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dir, '..')
mkdirSync(resolve(root, 'media'), { recursive: true })

// ── dimensions ────────────────────────────────────────────────────────────────
const W = 560
const H = 340
const FPS = 18
const MS  = 1000 / FPS

// ── easing (ease-out cubic) ───────────────────────────────────────────────────
function easeOut(t) { return 1 - Math.pow(1 - t, 3) }
function easeIn(t)  { return t * t * t }

// ── palette (solid colors only — GIF-safe) ────────────────────────────────────
const C = {
  bg:       '#f4f5f7',
  surface:  '#ffffff',
  nav:      '#1e1e2e',
  navText:  '#c9d1e0',
  heading:  '#111827',
  sub:      '#6b7280',
  btn:      '#4f46e5',
  btnText:  '#ffffff',
  card:     '#f9fafb',
  cardBdr:  '#e5e7eb',
  cardText: '#374151',
  slat:     '#2d2d2d',
  slatLine: '#444444',
  signBg:   '#f59e0b',
  signBdr:  '#b45309',
  signText: '#1c1917',
  signSub:  '#44403c',
  white:    '#ffffff',
}

function hex(color) {
  const r = parseInt(color.slice(1,3),16)
  const g = parseInt(color.slice(3,5),16)
  const b = parseInt(color.slice(5,7),16)
  return [r,g,b]
}

function fill(ctx, color) { ctx.fillStyle = color }
function stroke(ctx, color, w=1) { ctx.strokeStyle = color; ctx.lineWidth = w }

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x+r, y)
  ctx.lineTo(x+w-r, y)
  ctx.quadraticCurveTo(x+w, y, x+w, y+r)
  ctx.lineTo(x+w, y+h-r)
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h)
  ctx.lineTo(x+r, y+h)
  ctx.quadraticCurveTo(x, y+h, x, y+h-r)
  ctx.lineTo(x, y+r)
  ctx.quadraticCurveTo(x, y, x+r, y)
  ctx.closePath()
}

// ── draw the underlying "page" ────────────────────────────────────────────────
function drawPage(ctx) {
  // outer bg
  fill(ctx, C.bg); ctx.fillRect(0,0,W,H)

  // card surface
  fill(ctx, C.surface); ctx.fillRect(20,20,W-40,H-40)

  // nav bar
  fill(ctx, C.nav); ctx.fillRect(20,20,W-40,46)
  fill(ctx, C.white)
  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText('● shutterclose', 38, 43)
  fill(ctx, C.navText)
  ctx.font = '12px system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('Docs   GitHub   npm', W-38, 43)

  // hero heading
  fill(ctx, C.heading)
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Roller-shutter for the web', W/2, 118)

  // sub
  fill(ctx, C.sub)
  ctx.font = '13px system-ui, sans-serif'
  ctx.fillText('Zero deps · React · Vue · TypeScript', W/2, 143)

  // CTA button
  fill(ctx, C.btn)
  roundRect(ctx, W/2-72, 160, 144, 36, 8); ctx.fill()
  fill(ctx, C.btnText)
  ctx.font = 'bold 13px system-ui, sans-serif'
  ctx.fillText('npm install shutterclose', W/2, 182)

  // three cards
  ctx.textAlign = 'left'
  const cards = [
    { label: 'Vanilla JS', code: 'ShutterClose.close(el)' },
    { label: 'React',      code: '<ShutterClose isShut />' },
    { label: 'Vue',        code: '<ShutterClose :isShut />' },
  ]
  cards.forEach((c, i) => {
    const cx = 42 + i * 163
    fill(ctx, C.card); roundRect(ctx, cx, 222, 145, 80, 6); ctx.fill()
    stroke(ctx, C.cardBdr); ctx.stroke()
    fill(ctx, C.heading)
    ctx.font = 'bold 11px system-ui, sans-serif'
    ctx.fillText(c.label, cx+12, 246)
    fill(ctx, C.sub)
    ctx.font = '10px monospace'
    ctx.fillText(c.code, cx+12, 278)
  })
}

// ── draw shutter at progress 0→1 ─────────────────────────────────────────────
const SLATS = 8
const SLAT_H = (H - 40) / SLATS  // fits inside the card (20px padding each side)
const OVERSHOOT = 3

function drawShutter(ctx, progress) {
  for (let i = 0; i < SLATS; i++) {
    const targetY = 20 + i * SLAT_H
    const startY  = 20 - OVERSHOOT * (H - 40)
    const y = startY + (targetY - startY) * progress

    // slat body
    fill(ctx, C.slat)
    ctx.fillRect(20, y, W-40, SLAT_H - 1)

    // slat separation line
    fill(ctx, C.slatLine)
    ctx.fillRect(20, y + SLAT_H - 1, W-40, 1)
  }
}

// ── draw sign ─────────────────────────────────────────────────────────────────
function drawSign(ctx, opacity) {
  if (opacity <= 0) return
  ctx.save()
  ctx.globalAlpha = opacity

  const sw = 210, sh = 76
  const sx = (W - sw) / 2, sy = (H - sh) / 2 + 4

  // shadow
  fill(ctx, '#00000040'); roundRect(ctx, sx+3, sy+3, sw, sh, 8); ctx.fill()

  // body
  fill(ctx, C.signBg); roundRect(ctx, sx, sy, sw, sh, 8); ctx.fill()
  stroke(ctx, C.signBdr, 2); ctx.stroke()

  // title
  fill(ctx, C.signText)
  ctx.font = 'bold 17px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🔒  CLOSED', sx+sw/2, sy+28)

  // divider
  fill(ctx, '#00000022'); ctx.fillRect(sx+18, sy+46, sw-36, 1)

  // subtitle
  fill(ctx, C.signSub)
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText("Come back soon", sx+sw/2, sy+60)

  ctx.restore()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

// ── timeline (seconds) ────────────────────────────────────────────────────────
const HOLD_OPEN   = 0.6
const CLOSE_DUR   = 1.3
const HOLD_CLOSED = 1.1
const OPEN_DUR    = 0.5
const HOLD_END    = 0.5
const TOTAL = HOLD_OPEN + CLOSE_DUR + HOLD_CLOSED + OPEN_DUR + HOLD_END

const totalFrames = Math.ceil(TOTAL * FPS)
console.log(`Rendering ${totalFrames} frames…`)

// ── encode ────────────────────────────────────────────────────────────────────
const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

const encoder = new GifEncoder(W, H, 'neuquant', true)
const out = resolve(root, 'media', 'demo.gif')
encoder.createReadStream().pipe(createWriteStream(out))
  .on('finish', () => { console.log(`✓ media/demo.gif (${totalFrames} frames)`) })

encoder.setDelay(Math.round(MS))
encoder.setRepeat(0)
encoder.setQuality(12)
encoder.start()

for (let f = 0; f < totalFrames; f++) {
  const t = f / FPS
  let shutProgress = 0
  let signOpacity  = 0

  if (t < HOLD_OPEN) {
    // open static
  } else if (t < HOLD_OPEN + CLOSE_DUR) {
    shutProgress = easeOut((t - HOLD_OPEN) / CLOSE_DUR)
  } else if (t < HOLD_OPEN + CLOSE_DUR + HOLD_CLOSED) {
    shutProgress = 1
    const p = (t - HOLD_OPEN - CLOSE_DUR) / HOLD_CLOSED
    signOpacity = Math.min(1, p * 4)
  } else if (t < HOLD_OPEN + CLOSE_DUR + HOLD_CLOSED + OPEN_DUR) {
    const p = (t - HOLD_OPEN - CLOSE_DUR - HOLD_CLOSED) / OPEN_DUR
    shutProgress = 1 - easeIn(p)
    signOpacity  = Math.max(0, 1 - p * 4)
  }
  // else: open again, shutProgress stays 0

  drawPage(ctx)
  if (shutProgress > 0.001) drawShutter(ctx, shutProgress)
  if (signOpacity  > 0.001) drawSign(ctx, signOpacity)

  encoder.addFrame(ctx)
}

encoder.finish()
