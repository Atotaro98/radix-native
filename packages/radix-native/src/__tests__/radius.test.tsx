/**
 * Component radius through Metrics, checked against Radix CSS (`--radius-N` scales
 * with `--scaling`; Kbd and Code are relative to their own font size).
 */
import React from 'react'
import { screen } from '@testing-library/react-native'
import { Badge, Button, Kbd, Code, Skeleton, Spinner, Progress, RadioCards } from '../index'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'

type Node = { type: unknown; props: { style?: unknown } }

const radii = (): number[] =>
  screen.UNSAFE_root.findAll((n: Node) => typeof n.type === 'string' && flat(n).borderRadius !== undefined)
    .map((n: Node) => flat(n).borderRadius as number)

describe('radius scales with the Theme', () => {
  it('Badge size 1 is max(radius-1, radius-full) × scaling', () => {
    renderWithTheme(<Badge testID="b">New</Badge>, { scaling: '110%', radius: 'medium' })
    expect(flat(screen.getByTestId('b')).borderRadius).toBeCloseTo(3.3, 6)
  })

  it('Button is still a pill for radius "full" at any scaling', () => {
    renderWithTheme(<Button>Go</Button>, { scaling: '90%', radius: 'full' })
    expect(radii()).toContain(9999)
  })
})

describe('em-relative radius', () => {
  it('Kbd is radius-factor × 0.35em', () => {
    renderWithTheme(<Kbd testID="k">K</Kbd>, { radius: 'large' })
    const fontSize = flat(screen.getByText('K')).fontSize as number
    expect(flat(screen.getByTestId('k')).borderRadius).toBeCloseTo(1.5 * 0.35 * fontSize, 6)
  })

  it('Kbd is square for radius "none"', () => {
    renderWithTheme(<Kbd testID="k">K</Kbd>, { radius: 'none' })
    expect(flat(screen.getByTestId('k')).borderRadius).toBe(0)
  })

  it('Code is (0.5px + 0.2em) × radius-factor', () => {
    renderWithTheme(<Code size={6}>x</Code>, { radius: 'small' })
    const style = flat(screen.getByText('x'))
    expect(style.borderRadius).toBeCloseTo((0.5 + 0.2 * (style.fontSize as number)) * 0.75, 6)
  })
})

describe('radius-1 parts', () => {
  it('Skeleton follows radius-1 instead of a fixed 4px', () => {
    renderWithTheme(<Skeleton testID="s" />, { radius: 'small' })
    expect(flat(screen.getByTestId('s', { includeHiddenElements: true })).borderRadius).toBeCloseTo(2.25, 6)
  })

  it('Spinner leaves follow radius-1', () => {
    renderWithTheme(<Spinner />, { radius: 'large' })
    expect(radii().filter((r) => r === 4.5)).toHaveLength(8)
  })
})

describe('Progress', () => {
  it('rounds the root but leaves the indicator to be clipped by it', () => {
    renderWithTheme(<Progress value={50} testID="p" />, { radius: 'small' })
    const root = screen.getByTestId('p')
    expect(flat(root).borderRadius).toBeGreaterThan(0)
    const indicator = root.children[0] as unknown as { props: { style?: unknown } }
    expect(flat(indicator).borderRadius).toBeUndefined()
  })
})

describe('RadioCards', () => {
  it.each<[1 | 2 | 3, number]>([[1, 6], [2, 6], [3, 8]])(
    'size %i uses Radix radius levels 3 / 3 / 4 (%ipx at medium)',
    (size, expected) => {
      renderWithTheme(
        <RadioCards size={size} defaultValue="a">
          <RadioCards.Item value="a">A</RadioCards.Item>
        </RadioCards>,
        { radius: 'medium' },
      )
      expect(radii()).toContain(expected)
    },
  )
})
