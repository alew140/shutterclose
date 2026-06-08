import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShutterCloseVue from '../../src/vue/ShutterClose'

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

  it('wrapper div has position:relative style', () => {
    const wrapper = mount(ShutterCloseVue, {
      slots: { default: '<span />' },
    })
    expect((wrapper.element as HTMLElement).style.position).toBe('relative')
  })

  it('emits closed event when isShut prop becomes true', async () => {
    const wrapper = mount(ShutterCloseVue, {
      props: { isShut: false, duration: 0.1 },
      slots: { default: '<span />' },
    })
    await wrapper.setProps({ isShut: true })
    vi.advanceTimersByTime(500)
    await vi.runAllTimersAsync()
    expect(wrapper.emitted('closed')).toBeTruthy()
  })

  it('adds sc-shutter to DOM when isShut becomes true', async () => {
    const wrapper = mount(ShutterCloseVue, {
      props: { isShut: false, duration: 0.1 },
      slots: { default: '<span />' },
      attachTo: document.body,
    })
    await wrapper.setProps({ isShut: true })
    vi.advanceTimersByTime(500)
    await vi.runAllTimersAsync()
    expect(wrapper.element.querySelector('.sc-shutter')).not.toBeNull()
  })
})
