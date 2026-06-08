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
