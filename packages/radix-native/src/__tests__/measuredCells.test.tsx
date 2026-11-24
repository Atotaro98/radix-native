import React, { useMemo } from 'react'
import { View } from 'react-native'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { naturalWidthStyle, useMeasuredCell, useMeasuredCells, useWidest, useWidestCell, type MeasuredCells } from '../hooks/useWidest'

type Meta = { col: number }
let seen: MeasuredCells<Meta>

function Cell({ cells, id, col }: { cells: MeasuredCells<Meta>; id: string; col: number }) {
  const meta = useMemo(() => ({ col }), [col])
  return <View testID={id} onLayout={useMeasuredCell(cells, { meta })} />
}
function Columns({ ids, col = 0 }: { ids: string[]; col?: number }) {
  const cells = useMeasuredCells<Meta>()
  seen = cells
  return <>{ids.map((id) => <Cell key={id} cells={cells} id={id} col={col} />)}</>
}
const measure = (id: string, width: number) => act(() => {
  fireEvent(screen.getByTestId(id), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height: 20 } } })
})

describe('Measured columns', () => {
  it('is not ready until every registered cell has reported', () => {
    render(<Columns ids={['a', 'b']} />)
    expect(seen.ready).toBe(false)
    measure('a', 40)
    expect(seen.ready).toBe(false)
    measure('b', 70)
    expect(seen.ready).toBe(true)
    expect(seen.cells).toEqual([{ col: 0, natural: 40 }, { col: 0, natural: 70 }])
  })

  it('a cell that unmounts leaves the columns', () => {
    const { rerender } = render(<Columns ids={['a', 'b']} />)
    measure('a', 40)
    rerender(<Columns ids={['a']} />)
    expect(seen.ready).toBe(true)
    expect(seen.cells).toEqual([{ col: 0, natural: 40 }])
  })

  it('a cell added later makes them not ready again', () => {
    const { rerender } = render(<Columns ids={['a']} />)
    measure('a', 40)
    rerender(<Columns ids={['a', 'b']} />)
    expect(seen.ready).toBe(false)
  })

  it('a cell whose meta changes keeps its measured width (its layout does not fire again)', () => {
    const { rerender } = render(<Columns ids={['a']} col={0} />)
    measure('a', 40)
    rerender(<Columns ids={['a']} col={2} />)
    expect(seen.cells).toEqual([{ col: 2, natural: 40 }])
    expect(seen.ready).toBe(true)
  })

  it('the measuring wrapper wraps only inside a width the cell owns', () => {
    expect(naturalWidthStyle(false).maxWidth).toBeUndefined()
    expect(naturalWidthStyle(true).maxWidth).toBe('100%')
  })
})

describe('useWidest: every cell takes the widest', () => {
  let widest: number | null
  function W({ id, cells, min }: { id: string; cells: ReturnType<typeof useWidest>; min?: number }) {
    return <View testID={id} onLayout={useWidestCell(cells, true, min)} />
  }
  function Row({ min }: { min?: number }) {
    const cells = useWidest()
    widest = cells.widest
    return <><W id="a" cells={cells} min={min} /><W id="b" cells={cells} /></>
  }
  it('is null before any report, then the widest', () => {
    render(<Row />)
    expect(widest).toBeNull()
    measure('a', 40)
    measure('b', 90)
    expect(widest).toBe(90)
    measure('b', 30)
    expect(widest).toBe(40)
  })
  it('counts a cell\'s own minimum width', () => {
    render(<Row min={120} />)
    measure('a', 40)
    measure('b', 90)
    expect(widest).toBe(120)
  })
})
