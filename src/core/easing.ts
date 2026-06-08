export function generateEasing(deceleration: number): string {
  const t = Math.min(1, Math.max(0, deceleration / 100))
  const x2 = Math.min(1, 0.5 + t * 0.4)
  const y2 = t
  return `cubic-bezier(0.100, 0.500, ${x2.toFixed(3)}, ${y2.toFixed(3)})`
}
