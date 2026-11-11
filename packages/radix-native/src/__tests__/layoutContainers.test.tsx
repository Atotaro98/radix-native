import React from 'react'
import { StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { AspectRatio } from '../components/layout/AspectRatio'

type Node = { props: { style?: unknown }; children: unknown[] }
const flat = (node: { props: { style?: unknown } }): ViewStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}
const inner = (node: Node) => node.children[0] as Node

describe('Container (container.css)', () => {
  it.each([[1, 448], [2, 688], [3, 880], [4, 1136]] as const)(
    'size %i caps the inner View at --container-%i (%ipx, not scaled)',
    (size, max) => {
      renderWithTheme(<Container size={size} testID="c"><View /></Container>, { scaling: '110%' })
      expect(flat(inner(screen.getByTestId('c')))).toMatchObject({ width: '100%', maxWidth: max })
    },
  )

  it('outer is a growing column, centered by default', () => {
    renderWithTheme(<Container testID="c"><View /></Container>)
    expect(flat(screen.getByTestId('c'))).toMatchObject({
      display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, flexShrink: 0,
    })
  })

  it.each([['left', 'flex-start'], ['right', 'flex-end']] as const)('align="%s" → %s', (align, value) => {
    renderWithTheme(<Container align={align} testID="c"><View /></Container>)
    expect(flat(screen.getByTestId('c')).alignItems).toBe(value)
  })

  it('size props go to the inner View, the other Layout props to the outer one', () => {
    renderWithTheme(<Container maxWidth={300} height={50} px={4} testID="c"><View /></Container>)
    const outer = screen.getByTestId('c')
    expect(flat(inner(outer))).toMatchObject({ maxWidth: 300, height: 50 })
    expect(flat(outer)).toMatchObject({ paddingLeft: 16, paddingRight: 16 })
    expect(flat(outer).height).toBeUndefined()
  })

  it('display="none" hides it', () => {
    renderWithTheme(<Container display="none" testID="c"><View /></Container>)
    expect(flat(screen.getByTestId('c', { includeHiddenElements: true })).display).toBe('none')
  })
})

describe('Section (section.css)', () => {
  it.each([[1, 24], [2, 40], [3, 64], [4, 80]] as const)('size %i has %ipx vertical padding', (size, pad) => {
    renderWithTheme(<Section size={size} testID="s" />)
    const s = flat(screen.getByTestId('s'))
    expect([s.paddingTop, s.paddingBottom, s.paddingLeft]).toEqual([pad, pad, undefined])
  })

  it('defaults to size 3 and scales (80px × scaling for size 4)', () => {
    renderWithTheme(<><Section testID="a" /><Section size={4} testID="b" /></>, { scaling: '90%' })
    expect(flat(screen.getByTestId('a')).paddingTop).toBe(58)
    expect(flat(screen.getByTestId('b')).paddingTop).toBe(72)
  })

  it('padding props override the size padding', () => {
    renderWithTheme(<Section pt={2} testID="s" />)
    const s = flat(screen.getByTestId('s'))
    expect([s.paddingTop, s.paddingBottom]).toEqual([8, 64])
  })
})

describe('AspectRatio', () => {
  it('fills the width and sets the ratio (default 1)', () => {
    renderWithTheme(<><AspectRatio testID="a" /><AspectRatio ratio={16 / 9} testID="b" /></>)
    expect(flat(screen.getByTestId('a'))).toMatchObject({ width: '100%', aspectRatio: 1 })
    expect(flat(screen.getByTestId('b')).aspectRatio).toBeCloseTo(16 / 9)
  })
})
