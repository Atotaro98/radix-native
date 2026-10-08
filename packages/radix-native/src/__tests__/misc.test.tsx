import React from 'react'
import { StyleSheet, Text as RNText } from 'react-native'
import { act, renderHook, screen } from '@testing-library/react-native'
import { Theme, Spinner, Skeleton, Grid, Box, TextField, Progress, Text } from '../index'
import { useControllableState } from '../hooks/useControllableState'
import { renderWithTheme } from './helpers/render'

describe('loading toggles (rules of hooks)', () => {
  const themed = (ui: React.ReactElement) => <Theme appearance="light">{ui}</Theme>

  it('Spinner can switch loading on and off', () => {
    const { rerender } = renderWithTheme(<Spinner loading><RNText>done</RNText></Spinner>)
    expect(screen.getByLabelText('Loading')).toBeTruthy()
    expect(() => rerender(themed(<Spinner loading={false}><RNText>done</RNText></Spinner>))).not.toThrow()
    expect(screen.getByText('done')).toBeTruthy()
    expect(() => rerender(themed(<Spinner loading><RNText>done</RNText></Spinner>))).not.toThrow()
    expect(screen.getByLabelText('Loading')).toBeTruthy()
  })

  it('Skeleton can switch loading on and off', () => {
    const { rerender } = renderWithTheme(<Skeleton loading><Text>content</Text></Skeleton>)
    expect(() => rerender(themed(<Skeleton loading={false}><Text>content</Text></Skeleton>))).not.toThrow()
    expect(() => rerender(themed(<Skeleton loading><Text>content</Text></Skeleton>))).not.toThrow()
  })
})

describe('Grid', () => {
  it('groups children into rows of `columns`, padding the last row', () => {
    renderWithTheme(
      <Grid columns={3} gap={2} testID="grid">
        {['a', 'b', 'c', 'd'].map(t => <RNText key={t}>{t}</RNText>)}
      </Grid>,
    )
    const rowOf = (label: string) => {
      let node = screen.getByText(label).parent
      while (node && StyleSheet.flatten(node.props.style)?.flexDirection !== 'row') node = node.parent
      return node!
    }
    expect(rowOf('a')).toBe(rowOf('c'))
    expect(rowOf('d')).not.toBe(rowOf('a'))
    // Last row: 1 item + 2 equal-width spacers keep cell widths identical
    const lastRowCells = rowOf('d').children.filter((c: unknown) => typeof c !== 'string')
    expect(lastRowCells).toHaveLength(3)
  })
})

describe('margins', () => {
  it("accepts 'auto' as a margin value", () => {
    renderWithTheme(<Box ml="auto" mt={2} testID="box" />)
    expect(StyleSheet.flatten(screen.getByTestId('box').props.style)).toMatchObject({
      marginLeft: 'auto',
      marginTop: 8,
    })
  })
})

describe('TextField', () => {
  it('exposes disabled state on the input itself', () => {
    renderWithTheme(<TextField disabled placeholder="Email" />)
    const input = screen.getByPlaceholderText('Email')
    expect(input.props.editable).toBe(false)
    expect(input.props.accessibilityState).toMatchObject({ disabled: true })
  })

  it('soft variant placeholder uses accent-12 at 60% alpha', () => {
    renderWithTheme(<TextField variant="soft" placeholder="Search" />)
    expect(screen.getByPlaceholderText('Search').props.placeholderTextColor).toMatch(/^#[0-9a-f]{6}99$/i)
  })
})

describe('Progress', () => {
  it('reports its value and never produces NaN widths', () => {
    renderWithTheme(<Progress value={5} max={0} testID="p" />)
    const p = screen.getByTestId('p')
    expect(p.props.accessibilityValue).toEqual({ min: 0, max: 0, now: 5 })
    const indicator = (p.children[0] as unknown as { props: { style: unknown } })
    expect(JSON.stringify(StyleSheet.flatten(indicator.props.style as never))).not.toContain('NaN')
  })
})

describe('useControllableState', () => {
  it('applies functional updates against the latest value', () => {
    const onChange = jest.fn()
    const { result } = renderHook(() =>
      useControllableState<number>({ prop: undefined, defaultProp: 0, onChange }),
    )
    act(() => {
      result.current[1](v => v + 1)
      result.current[1](v => v + 1)
    })
    expect(result.current[0]).toBe(2)
    expect(onChange).toHaveBeenLastCalledWith(2)
  })

  it('does not call onChange when the value does not change', () => {
    const onChange = jest.fn()
    const { result } = renderHook(() =>
      useControllableState<string>({ prop: 'a', defaultProp: '', onChange }),
    )
    act(() => result.current[1]('a'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
