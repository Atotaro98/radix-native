import React from 'react'
import * as lib from '../index'
import { isLibraryComponent, tint } from '../components/internal/tint'

const Icon = (_props: { color?: string }) => null

describe('tint', () => {
  it.each<[string, () => React.ReactElement, string | undefined]>([
    ['an icon without a color takes it', () => <Icon />, '#111'],
    ['an icon keeps its own color', () => <Icon color="red" />, 'red'],
    ['AccessibleIcon takes it for its icon', () => <lib.AccessibleIcon label="x"><Icon /></lib.AccessibleIcon>, '#111'],
    ['a host element is left alone', () => React.createElement('RCTView'), undefined],
    ['a fragment is left alone', () => <><Icon /></>, undefined],
    ['a Button is left alone (its color names a Theme color)', () => <lib.Button>x</lib.Button>, undefined],
    ['a compound part is left alone', () => <lib.Callout.Text>x</lib.Callout.Text>, undefined],
    ['a Flex is left alone', () => <lib.Flex />, undefined],
  ])('%s', (_label, element, expected) => {
    expect((tint(element(), '#111').props as { color?: string }).color).toBe(expected)
  })

  it('returns the element as given without a color', () => {
    const icon = <Icon />
    expect(tint(icon, undefined)).toBe(icon)
  })
})

describe('every component the library exports is known to tint', () => {
  // The only exports that take a color string
  const TAKE_A_COLOR_STRING = new Set(['AccessibleIcon', 'AnimatedPressable'])
  const components = Object.entries(lib).filter(([name, value]) =>
    /^[A-Z]/.test(name) && name !== name.toUpperCase()
    && (typeof value === 'function' || (typeof value === 'object' && value !== null && 'displayName' in value)))

  it.each(components.map(([name]) => name))('%s', (name) => {
    const value = (lib as Record<string, unknown>)[name]
    expect(isLibraryComponent(value)).toBe(!TAKE_A_COLOR_STRING.has(name))
  })
})
