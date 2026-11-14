import React from 'react'
import { View } from 'react-native'
import { screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { Skeleton } from '../components/feedback/Skeleton'
import { Button } from '../components/actions/Button'
import { Checkbox } from '../components/actions/Checkbox'
import { Switch } from '../components/actions/Switch'
import { Box } from '../components/layout/Box'
import { Text } from '../components/typography/Text'

type Node = { type: unknown; props: { style?: unknown; children?: unknown }; children: unknown[] }
const root = () => screen.getByTestId('s', { includeHiddenElements: true }) as unknown as Node
/** The pulsing background: the first child of the skeleton. */
const pulse = () => flat(root().children[0] as Node)

describe('Skeleton (skeleton.css)', () => {
  it('an empty skeleton is var(--space-3) tall, scaled', () => {
    renderWithTheme(<Skeleton testID="s" width={80} />, { scaling: '90%' })
    expect(flat(root()).height).toBe(11)
  })

  it('never takes touches, even if the consumer asks (pointer-events: none !important)', () => {
    renderWithTheme(<Skeleton testID="s" {...{ pointerEvents: 'auto' as const }} />)
    expect((root().props as { pointerEvents?: string }).pointerEvents).toBe('none')
  })

  it('plain text takes the surrounding text size', () => {
    renderWithTheme(<Text size={5}><Skeleton testID="s">Loading</Skeleton></Text>)
    const t = screen.getByText('Loading', { includeHiddenElements: true })
    expect(flat(t).fontSize).toBe(20)
  })

  it('defaults to radius-1', () => {
    renderWithTheme(<Skeleton testID="s"><Box width={40} height={40} /></Skeleton>)
    expect(pulse().borderRadius).toBe(3)
  })

  it("keeps a wrapped Button's own (pill-capable) radius", () => {
    renderWithTheme(<Skeleton testID="s"><Button>Go</Button></Skeleton>, { radius: 'full' })
    expect(pulse().borderRadius).toBeGreaterThan(100)
  })

  it("keeps a wrapped Checkbox's radius (--skeleton-radius-override)", () => {
    renderWithTheme(<Skeleton testID="s"><Checkbox /></Skeleton>, { radius: 'full' })
    // base-checkbox: radius stays a small box even with radius="full"
    expect(pulse().borderRadius).toBeLessThan(10)
    expect(pulse().borderRadius).not.toBe(3)
  })

  it("keeps a wrapped Switch's track radius, from its own radius prop", () => {
    renderWithTheme(<Skeleton testID="s"><Switch radius="full" /></Skeleton>, { radius: 'none' })
    expect(pulse().borderRadius).toBeGreaterThan(100)
  })

  it('a Box without radius around a Button falls back to radius-1 (outermost wins)', () => {
    renderWithTheme(<Skeleton testID="s"><Box><Button>Go</Button></Box></Skeleton>, { radius: 'full' })
    // radius-1 = 3px × the radius="full" factor (1.5)
    expect(pulse().borderRadius).toBe(4.5)
  })
})

describe('Skeleton loading=false', () => {
  it('renders the children as they are', () => {
    renderWithTheme(<Skeleton loading={false}><View testID="c" /></Skeleton>)
    expect(screen.getByTestId('c')).toBeTruthy()
  })
})
