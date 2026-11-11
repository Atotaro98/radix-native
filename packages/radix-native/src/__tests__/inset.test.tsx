import React from 'react'
import { StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { Card } from '../components/layout/Card'
import { Inset, resolveInsetStyle } from '../components/layout/Inset'
import { NO_INSET, type InsetValues } from '../components/layout/InsetContext'

type Node = { type: unknown; props: { style?: unknown } }
const flat = (node: { props: { style?: unknown } }): ViewStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}

// A size-2 surface Card at 100%: --card-padding space-4 (16), border 1px, radius-4 (8).
const CARD: InsetValues = { padding: { top: 15, right: 15, bottom: 15, left: 15 }, borderWidth: 1, borderRadius: 8 }

describe('resolveInsetStyle (inset.css)', () => {
  it('border-box pulls by --inset-padding and rounds with radius − border width', () => {
    expect(resolveInsetStyle({ side: 'all', clip: 'border-box', margins: {}, padding: {}, inset: CARD })).toEqual({
      overflow: 'hidden',
      marginTop: -15, marginRight: -15, marginBottom: -15, marginLeft: -15,
      borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomRightRadius: 7, borderBottomLeftRadius: 7,
    })
  })

  it('padding-box pulls by --inset-padding + border width and keeps the full radius', () => {
    const s = resolveInsetStyle({ side: 'all', clip: 'padding-box', margins: {}, padding: {}, inset: CARD })
    expect([s.marginTop, s.borderTopLeftRadius]).toEqual([-16, 8])
  })

  it.each([
    ['top', ['marginTop', 'marginLeft', 'marginRight'], ['borderTopLeftRadius', 'borderTopRightRadius']],
    ['bottom', ['marginBottom', 'marginLeft', 'marginRight'], ['borderBottomLeftRadius', 'borderBottomRightRadius']],
    ['left', ['marginLeft', 'marginTop', 'marginBottom'], ['borderTopLeftRadius', 'borderBottomLeftRadius']],
    ['right', ['marginRight', 'marginTop', 'marginBottom'], ['borderTopRightRadius', 'borderBottomRightRadius']],
    ['x', ['marginLeft', 'marginRight'], []],
    ['y', ['marginTop', 'marginBottom'], []],
  ] as const)('side="%s" pulls and rounds only its sides', (side, pulled, rounded) => {
    const s = resolveInsetStyle({ side, clip: 'border-box', margins: {}, padding: {}, inset: CARD }) as Record<string, unknown>
    for (const k of ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']) {
      expect([k, s[k]]).toEqual([k, (pulled as readonly string[]).includes(k) ? -15 : undefined])
    }
    for (const k of ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius']) {
      expect([k, s[k]]).toEqual([k, (rounded as readonly string[]).includes(k) ? 7 : 0])
    }
  })

  it('adds the consumer margin to a pulled side and keeps it on the others', () => {
    const s = resolveInsetStyle({ side: 'top', clip: 'border-box', margins: { marginTop: 8, marginBottom: 8 }, padding: {}, inset: CARD })
    expect([s.marginTop, s.marginBottom]).toEqual([-7, 8])
  })

  it('p="current" restores the raw --inset-padding, "0" removes it', () => {
    const s = resolveInsetStyle({ side: 'top', clip: 'padding-box', margins: {}, padding: { bottom: 'current', top: '0' }, inset: CARD })
    expect([s.paddingBottom, s.paddingTop]).toEqual([15, 0])
  })

  it('does nothing but clip outside a container (0px fallbacks)', () => {
    const s = resolveInsetStyle({ side: 'all', clip: 'padding-box', margins: {}, padding: {}, inset: NO_INSET })
    expect([s.overflow, s.marginTop, s.borderTopLeftRadius]).toEqual(['hidden', 0, 0])
  })
})

describe('Inset inside a Card', () => {
  it('reads the Card size, border width and radius', () => {
    renderWithTheme(
      <Card size={2}>
        <Inset clip="padding-box" side="top" pb="current" testID="i"><View /></Inset>
      </Card>,
    )
    expect(flat(screen.getByTestId('i'))).toMatchObject({
      marginTop: -16, marginLeft: -16, marginRight: -16,
      paddingBottom: 15, borderTopLeftRadius: 8, borderBottomLeftRadius: 0,
    })
    expect(flat(screen.getByTestId('i')).marginBottom).toBeUndefined()
  })

  it('a ghost Card has no border: pulled by the full padding', () => {
    renderWithTheme(
      <Card size={1} variant="ghost">
        <Inset testID="i"><View /></Inset>
      </Card>,
    )
    expect(flat(screen.getByTestId('i')).marginTop).toBe(-12)
  })
})

describe('Card border', () => {
  it('is an overlay ring, so content starts at the card padding (Radix ::after box-shadow)', () => {
    renderWithTheme(<Card size={2} testID="c"><View /></Card>)
    const card = screen.getByTestId('c')
    expect(flat(card).borderWidth).toBeUndefined()
    expect(flat(card).padding).toBe(16)
    const ring = card.findAll((n: Node) => n !== card && typeof n.type === 'string' && flat(n).borderWidth === 1)
    expect(ring).toHaveLength(1)
    expect(flat(ring[0])).toMatchObject({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 8 })
  })

  it('ghost has no ring and pulls itself out by its padding (.rt-Card:where(.rt-variant-ghost))', () => {
    renderWithTheme(<Card size={1} variant="ghost" mt={2} testID="c"><View /></Card>)
    const card = screen.getByTestId('c')
    expect(card.findAll((n: Node) => typeof n.type === 'string' && flat(n).borderWidth === 1)).toHaveLength(0)
    expect(flat(card)).toMatchObject({ marginTop: 8 - 12, marginLeft: -12, marginRight: -12, marginBottom: -12 })
  })
})
