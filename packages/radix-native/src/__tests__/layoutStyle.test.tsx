/**
 * Layout props (Box, Flex, Grid), resolved like Radix's layout and margin prop defs.
 */
import React from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { screen } from '@testing-library/react-native'
import { Box, Flex, Grid } from '../index'
import { resolveLayoutStyle, splitLayoutProps } from '../utils/layoutStyle'
import { resolveMetrics } from '../utils/metrics'
import type { LayoutProps } from '../types/layoutProps'
import type { ThemeColor } from '../theme/theme.types'
import { renderWithTheme } from './helpers/render'

const rc = (token: ThemeColor) => `color(${token})`
const resolve = (props: LayoutProps, scaling: '100%' | '110%' = '100%') =>
  resolveLayoutStyle(props, resolveMetrics({ scaling, radius: props.radius ?? 'medium' }), rc)

describe('resolveLayoutStyle', () => {
  it('padding: side > axis > all', () => {
    expect(resolve({ p: 1, px: 2, pl: 3 })).toMatchObject({
      paddingTop: 4, paddingBottom: 4, paddingRight: 8, paddingLeft: 12,
    })
    expect(resolve({ py: 5 })).toMatchObject({ paddingTop: 24, paddingBottom: 24, paddingLeft: undefined })
  })

  it('margin: side > axis > all, negative tokens and auto', () => {
    expect(resolve({ m: 2, mx: -3, ml: 'auto' })).toMatchObject({
      marginTop: 8, marginBottom: 8, marginRight: -12, marginLeft: 'auto',
    })
  })

  it('scales space with the Theme', () => {
    expect(resolve({ p: 4 }, '110%')).toMatchObject({ paddingTop: 18 })
  })

  it('passes size, position and flex-child props through', () => {
    expect(resolve({
      width: 10, minWidth: '50%', maxWidth: 20, height: 30, minHeight: 1, maxHeight: 2,
      position: 'absolute', top: 1, right: 2, bottom: 3, left: 4,
      overflow: 'hidden', flexBasis: 5, flexShrink: 0, flexGrow: 1,
    })).toMatchObject({
      width: 10, minWidth: '50%', maxWidth: 20, height: 30, minHeight: 1, maxHeight: 2,
      position: 'absolute', top: 1, right: 2, bottom: 3, left: 4,
      overflow: 'hidden', flexBasis: 5, flexShrink: 0, flexGrow: 1,
    })
  })

  it('bg resolves a theme color; radius is radius-4, a pill for "full"', () => {
    expect(resolve({ bg: 'accent-3' }).backgroundColor).toBe('color(accent-3)')
    expect(resolve({ radius: 'medium' }).borderRadius).toBe(8)
    expect(resolve({ radius: 'large' }).borderRadius).toBe(12)
    expect(resolve({ radius: 'full' }).borderRadius).toBe(9999)
    expect(resolve({}).borderRadius).toBeUndefined()
    expect(resolve({}).backgroundColor).toBeUndefined()
  })

  it('splits Layout props from the rest', () => {
    const [layout, rest] = splitLayoutProps({ p: 2, width: 3, testID: 'x', direction: 'row' })
    expect(layout).toEqual({ p: 2, width: 3 })
    expect(rest).toEqual({ testID: 'x', direction: 'row' })
  })
})

const flat = (style: unknown): ViewStyle => StyleSheet.flatten(style as StyleProp<ViewStyle>) ?? {}

describe.each([
  ['Box', Box],
  ['Flex', Flex],
  ['Grid', Grid],
] as const)('%s', (_name, Component) => {
  const props: LayoutProps = { p: 2, mx: 'auto', width: 100, position: 'relative', bg: 'gray-2', radius: 'full' }

  it('resolves Layout props like the other layout primitives', () => {
    renderWithTheme(<Component testID="c" {...props} />)
    expect(flat(screen.getByTestId('c').props.style)).toMatchObject({
      paddingTop: 8, paddingLeft: 8, marginLeft: 'auto', marginRight: 'auto',
      width: 100, position: 'relative', borderRadius: 9999,
    })
    expect(flat(screen.getByTestId('c').props.style).backgroundColor).toEqual(expect.any(String))
  })

  it("lets the consumer's style win", () => {
    renderWithTheme(<Component testID="c" p={2} style={{ paddingTop: 1 }} />)
    expect(flat(screen.getByTestId('c').props.style)).toMatchObject({ paddingTop: 1, paddingBottom: 8 })
  })

  it('does not forward Layout props to the View', () => {
    renderWithTheme(<Component testID="c" p={2} bg="gray-2" />)
    expect(screen.getByTestId('c').props.p).toBeUndefined()
    expect(screen.getByTestId('c').props.bg).toBeUndefined()
  })
})
