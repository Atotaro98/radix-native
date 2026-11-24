import React from 'react'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { Slider } from '../components/forms/Slider'
import { beginDrag, commits, moveDrag, sliderLayout, stepThumb, thumbLabel, type SliderConfig } from '../utils/slider'

const base: SliderConfig = { min: 0, max: 100, step: 1, minStepsBetweenThumbs: 0, vertical: false, inverted: false, rtl: false }
/** A touch at `position` px along a 200px track. */
const press = (values: number[], position: number, c: Partial<SliderConfig> = {}) =>
  beginDrag(values, { ...base, ...c }, 200, position, position)

describe('a press on the track (Radix primitives slider.tsx)', () => {
  it('moves the closest thumb there, ties going to the first', () => {
    expect(press([20, 80], 60).values).toEqual([30, 80])
    expect(press([20, 80], 140).values).toEqual([20, 70])
    expect(press([20, 80], 100)).toMatchObject({ values: [50, 80], drag: { index: 0 } })
  })

  it('snaps to the step without float drift, and clamps to the scale', () => {
    expect(press([0], 60.00000000000001, { max: 1, step: 0.1 }).values).toEqual([0.3])
    expect(press([0], 94, { step: 5 }).values).toEqual([45])
    expect(press([0], 500).values).toEqual([100])
    expect(press([2], 56, { min: 2, max: 20, step: 5 }).values).toEqual([7])
  })

  it('returns the same values when the thumb is already there', () => {
    const values = [50]
    expect(press(values, 100).values).toBe(values)
  })

  // 50px of 200: a quarter of the way from the physical left / top
  it.each([
    ['horizontal', {}, 25],
    ['horizontal inverted', { inverted: true }, 75],
    ['horizontal in RTL', { rtl: true }, 75],
    ['horizontal inverted in RTL', { inverted: true, rtl: true }, 25],
    ['vertical (from the bottom)', { vertical: true }, 75],
    ['vertical inverted (from the top)', { vertical: true, inverted: true }, 25],
    ['vertical in RTL (unchanged)', { vertical: true, rtl: true }, 75],
  ] as const)('%s: a touch a quarter of the way in', (_name, c, value) => {
    expect(press([0], 50, c).values).toEqual([value])
  })

  it('an unmeasured track gives the minimum', () => {
    expect(beginDrag([50], base, 0, 80, 80).values).toEqual([0])
  })
})

describe('a drag, from grant to release', () => {
  it('follows the page delta from the grant, not the touch location', () => {
    const { drag, values } = press([20, 80], 60)
    expect(moveDrag(drag, values, base, 200, 100).values).toEqual([50, 80])
  })

  it('thumbs cross: the values stay sorted and the drag keeps the same thumb', () => {
    const { drag, values } = press([20, 80], 40)
    const crossed = moveDrag(drag, values, base, 200, 180)
    expect(crossed).toMatchObject({ values: [80, 90], drag: { index: 1 } })
    expect(moveDrag(crossed.drag, crossed.values, base, 200, 20).values).toEqual([10, 80])
  })

  it('a move that breaks minStepsBetweenThumbs is rejected: the thumb stops', () => {
    const c = { ...base, minStepsBetweenThumbs: 10 }
    const { drag, values } = beginDrag([20, 80], c, 200, 40, 40)
    expect(moveDrag(drag, values, c, 200, 140).values).toEqual([70, 80])
    const stopped = moveDrag(drag, [70, 80], c, 200, 150)
    expect(stopped.values).toEqual([70, 80])
  })

  it('commits only when the release is on other values than the grant', () => {
    const { drag, values } = press([50], 100)
    expect(commits(drag.start, values)).toBe(false)
    expect(commits(drag.start, moveDrag(drag, values, base, 200, 120).values)).toBe(true)
    const there = moveDrag(drag, values, base, 200, 120)
    expect(commits(drag.start, moveDrag(there.drag, there.values, base, 200, 100).values)).toBe(false)
  })
})

describe('accessibility steps', () => {
  it('moves one thumb by a step, within the scale', () => {
    expect(stepThumb([50], { ...base, step: 5 }, 0, 1)).toEqual([55])
    expect(stepThumb([50], { ...base, step: 5 }, 0, -1)).toEqual([45])
    const top = [100]
    expect(stepThumb(top, base, 0, 1)).toBe(top)
  })
  it('respects minStepsBetweenThumbs', () => {
    const values = [70, 80]
    expect(stepThumb(values, { ...base, step: 5, minStepsBetweenThumbs: 2 }, 0, 1)).toBe(values)
  })
})

describe('where the parts are drawn', () => {
  it('keeps the thumbs inside the track', () => {
    expect(sliderLayout([0, 50, 100], base, 200, 12).thumbCenters).toEqual([6, 100, 194])
  })

  it('one value fills from the start edge; several fill between the outer thumbs', () => {
    expect(sliderLayout([30], base, 200, 12).range).toEqual({ startEdge: 'left', endEdge: 'right', start: 0, end: 70 })
    expect(sliderLayout([20, 80], base, 200, 12).range).toMatchObject({ start: 20, end: 20 })
  })

  it.each([
    ['horizontal', {}, 'left', 53],
    ['horizontal inverted', { inverted: true }, 'right', 147],
    // Styles follow the reading direction: React Native mirrors `left`, so RTL draws the same numbers
    ['horizontal in RTL', { rtl: true }, 'left', 53],
    ['vertical', { vertical: true }, 'bottom', 147],
    ['vertical inverted', { vertical: true, inverted: true }, 'top', 53],
  ] as const)('%s: start edge and the 25%% thumb', (_name, c, startEdge, center) => {
    const layout = sliderLayout([25], { ...base, ...c }, 200, 12)
    expect(layout.range.startEdge).toBe(startEdge)
    expect(layout.thumbCenters).toEqual([center])
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

  it('vertical: reads the y axis, from the bottom', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Slider testID="s" orientation="vertical" defaultValue={[50]} onValueChange={onValueChange} />)
    layout(8, 200)
    act(() => {
      fireEvent(screen.getByTestId('s'), 'responderGrant', { nativeEvent: { locationX: 4, locationY: 50, pageX: 0, pageY: 50 } })
    })
    expect(onValueChange).toHaveBeenLastCalledWith([75])
  })

  it('a terminated drag ends like a release', () => {
    const onValueCommit = jest.fn()
    renderWithTheme(<Slider testID="s" defaultValue={[20]} onValueCommit={onValueCommit} />)
    layout(200)
    touch('responderGrant', 100)
    touch('responderTerminate', 100)
    expect(onValueCommit).toHaveBeenCalledWith([50])
  })

  it('disabled ignores touches', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Slider testID="s" defaultValue={[50]} disabled onValueChange={onValueChange} />)
    expect(screen.getByTestId('s').props.onStartShouldSetResponder()).toBe(false)
  })
})
