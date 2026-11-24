import React from 'react'
import { Text } from 'react-native'
import { act, render, screen } from '@testing-library/react-native'
import type { SharedValue } from 'react-native-reanimated'
import { useEnterExit, usePresence } from '../components/internal/presence'

const mockMotion = { reduced: false }
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated'),
  useReducedMotion: () => mockMotion.reduced,
}))

let progress: SharedValue<number>

function Overlay({ open, ready = true, close = 100 }: { open: boolean; ready?: boolean; close?: number }) {
  const { present, onExited } = usePresence(open)
  return present ? <Part open={open} ready={ready} close={close} onExited={onExited} /> : null
}
function Part({ open, ready, close, onExited }: { open: boolean; ready: boolean; close: number; onExited: () => void }) {
  progress = useEnterExit({ open, ready, timing: { open: 160, close }, onExited })
  return <Text>content</Text>
}

describe('Presence', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => {
    jest.useRealTimers()
    mockMotion.reduced = false
  })
  const advance = (ms: number) => act(() => { jest.advanceTimersByTime(ms) })

  it('is not mounted while closed', () => {
    render(<Overlay open={false} />)
    expect(screen.queryByText('content')).toBeNull()
  })

  it('enters when opened, stays mounted through the exit, then unmounts', () => {
    const { rerender } = render(<Overlay open />)
    advance(200)
    expect(progress.value).toBe(1)
    rerender(<Overlay open={false} />)
    expect(screen.queryByText('content')).not.toBeNull()
    advance(200)
    expect(screen.queryByText('content')).toBeNull()
  })

  it('waits until ready (an Anchored overlay not placed yet) before entering', () => {
    const { rerender } = render(<Overlay open ready={false} />)
    advance(200)
    expect(progress.value).toBe(0)
    rerender(<Overlay open ready />)
    advance(200)
    expect(progress.value).toBe(1)
  })

  it('closed before it ever entered: unmounts at once', () => {
    const { rerender } = render(<Overlay open ready={false} />)
    rerender(<Overlay open={false} ready={false} />)
    expect(screen.queryByText('content')).toBeNull()
  })

  it('reopened during the exit: stays mounted and enters again', () => {
    const { rerender } = render(<Overlay open />)
    advance(200)
    rerender(<Overlay open={false} />)
    advance(30)
    rerender(<Overlay open />)
    advance(300)
    expect(screen.queryByText('content')).not.toBeNull()
    expect(progress.value).toBe(1)
  })

  it('a 0ms exit unmounts at once (Tooltip)', () => {
    const { rerender } = render(<Overlay open close={0} />)
    advance(200)
    rerender(<Overlay open={false} close={0} />)
    expect(screen.queryByText('content')).toBeNull()
  })

  it('Reduce Motion: appears and disappears at once', () => {
    mockMotion.reduced = true
    const { rerender } = render(<Overlay open />)
    expect(progress.value).toBe(1)
    rerender(<Overlay open={false} />)
    expect(screen.queryByText('content')).toBeNull()
  })
})
