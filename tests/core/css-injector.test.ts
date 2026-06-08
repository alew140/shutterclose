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
