import React from 'react'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { Slider } from '../components/forms/Slider'
import {
  getClosestValueIndex, snapToStep, thumbCenter, thumbLabel, updateValues, valueFromPosition,
} from '../utils/slider'

const flat = (node: { props: { style?: unknown } }): ViewStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}

describe('slider math (Radix primitives slider.tsx)', () => {
  it('snaps to the step without float drift and clamps', () => {
    expect(snapToStep(0.30000000000000004, { min: 0, max: 1, step: 0.1 })).toBe(0.3)
    expect(snapToStep(47, { min: 0, max: 100, step: 5 })).toBe(45)
    expect(snapToStep(130, { min: 0, max: 100, step: 1 })).toBe(100)
    expect(snapToStep(7, { min: 2, max: 20, step: 5 })).toBe(7)
  })

  it('picks the closest thumb, ties going to the first', () => {
    expect(getClosestValueIndex([20, 80], 30)).toBe(0)
    expect(getClosestValueIndex([20, 80], 70)).toBe(1)
    expect(getClosestValueIndex([20, 80], 50)).toBe(0)
  })

  it('lets thumbs cross and re-sorts, following the moved value', () => {
    expect(updateValues([20, 80], 0, 90, 0)).toEqual({ values: [80, 90], index: 1 })
  })

  it('rejects a move that breaks minStepsBetweenThumbs instead of clamping', () => {
    expect(updateValues([20, 80], 0, 75, 10)).toBeNull()
    expect(updateValues([20, 80], 0, 70, 10)).toEqual({ values: [70, 80], index: 0 })
  })

  it('maps a position to a value along the slide direction', () => {
    expect(valueFromPosition(50, 200, { min: 0, max: 100, fromEnd: false })).toBe(25)
    expect(valueFromPosition(50, 200, { min: 0, max: 100, fromEnd: true })).toBe(75)
  })

  it('keeps the thumb inside the track', () => {
    expect([thumbCenter(0, 200, 12), thumbCenter(100, 200, 12), thumbCenter(50, 200, 12)]).toEqual([6, 194, 100])
  })

  it('labels two thumbs Minimum / Maximum, more as "Value i of n"', () => {
    expect([thumbLabel(0, 1), thumbLabel(0, 2), thumbLabel(1, 2), thumbLabel(2, 3)]).toEqual([undefined, 'Minimum', 'Maximum', 'Value 3 of 3'])
  })
})

describe('Slider (slider.css)', () => {
  const layout = (width: number, height = 8) => {
    act(() => {
      fireEvent(screen.getByTestId('s'), 'layout', { nativeEvent: { layout: { width, height, x: 0, y: 0 } } })
    })
  }
  const touch = (type: string, x: number, pageX = x) =>
    act(() => {
      fireEvent(screen.getByTestId('s'), type, { nativeEvent: { locationX: x, locationY: 4, pageX, pageY: 0 } })
    })

  it.each([[1, 6], [2, 8], [3, 10]] as const)('size %i track is %ipx', (size, track) => {
    renderWithTheme(<Slider testID="s" size={size} defaultValue={[50]} />)
    expect(flat(screen.getByTestId('s')).height).toBe(track)
  })

  it('renders no thumbs without value or defaultValue (Radix Themes)', () => {
    renderWithTheme(<Slider testID="s" />)
    expect(screen.queryAllByRole('adjustable')).toHaveLength(0)
  })

  it('a press moves the closest thumb; drag follows; commit fires once on release', () => {
    const onValueChange = jest.fn()
    const onValueCommit = jest.fn()
    renderWithTheme(<Slider testID="s" defaultValue={[20, 80]} onValueChange={onValueChange} onValueCommit={onValueCommit} />)
    layout(200)
    touch('responderGrant', 60)
    expect(onValueChange).toHaveBeenLastCalledWith([30, 80])
    touch('responderMove', 999, 100)
    expect(onValueChange).toHaveBeenLastCalledWith([50, 80])
    expect(onValueCommit).not.toHaveBeenCalled()
    touch('responderRelease', 100)
    expect(onValueCommit).toHaveBeenCalledTimes(1)
    expect(onValueCommit).toHaveBeenCalledWith([50, 80])
  })

  it('does not commit when the value did not change', () => {
    const onValueCommit = jest.fn()
    renderWithTheme(<Slider testID="s" defaultValue={[50]} onValueCommit={onValueCommit} />)
    layout(200)
    touch('responderGrant', 100)
    touch('responderRelease', 100)
    expect(onValueCommit).not.toHaveBeenCalled()
  })

  it('thumbs are adjustable: increment / decrement by step and commit', () => {
    const onValueCommit = jest.fn()
    renderWithTheme(<Slider testID="s" defaultValue={[50]} step={5} onValueCommit={onValueCommit} />)
    const thumb = screen.getByRole('adjustable')
    expect(thumb.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 })
    act(() => { fireEvent(thumb, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } }) })
    expect(onValueCommit).toHaveBeenLastCalledWith([55])
  })

  it('disabled ignores touches', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Slider testID="s" defaultValue={[50]} disabled onValueChange={onValueChange} />)
    expect(screen.getByTestId('s').props.onStartShouldSetResponder()).toBe(false)
  })
})
