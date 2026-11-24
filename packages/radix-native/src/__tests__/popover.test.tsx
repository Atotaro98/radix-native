import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { FakeAnchor, layout, touchWindow } from './helpers/overlay'
import { Popover } from '../components/overlays/Popover'
import { Theme } from '../theme/Theme'

const RECT = [40, 100, 90, 32] as const

function Example(props: Partial<React.ComponentProps<typeof Popover.Root>>) {
  return (
    <Popover.Root {...props}>
      <Popover.Trigger><FakeAnchor rect={RECT} /></Popover.Trigger>
      <Popover.Content testID="content">
        <Text>Popover body</Text>
        <Popover.Close><Pressable testID="close"><Text>Close</Text></Pressable></Popover.Close>
      </Popover.Content>
    </Popover.Root>
  )
}

const layoutContent = (width = 200, height = 120) => layout('content', width, height)

describe('Popover', () => {
  it('is placed from Popover.Anchor when there is one, also after the Trigger is pressed', () => {
    function Anchor({ ref }: { ref?: React.Ref<unknown> }) {
      React.useImperativeHandle(ref, () => ({ measureInWindow: (cb: (...r: number[]) => void) => cb(10, 300, 200, 40) }))
      return <View />
    }
    renderWithTheme(
      <Popover.Root>
        <Popover.Anchor><Anchor /></Popover.Anchor>
        <Popover.Trigger><FakeAnchor rect={RECT} /></Popover.Trigger>
        <Popover.Content testID="content"><Text>Body</Text></Popover.Content>
      </Popover.Root>,
    )
    fireEvent.press(screen.getByTestId('trigger'))
    layoutContent()
    expect(flat(screen.getByTestId('content'))).toMatchObject({ left: 10, top: 300 + 40 + 8 })
  })

  it('opens from the trigger and places itself below it, aligned to its start, 8px away', () => {
    renderWithTheme(<Example />)
    expect(screen.queryByText('Popover body')).toBeNull()
    fireEvent.press(screen.getByTestId('trigger'))
    layoutContent()
    expect(flat(screen.getByTestId('content'))).toMatchObject({ left: 40, top: 100 + 32 + 8, minWidth: 90 })
  })

  it("the screen reader's escape gesture closes it", () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<Example defaultOpen onOpenChange={onOpenChange} />)
    fireEvent(screen.getByTestId('content', { includeHiddenElements: true }), 'accessibilityEscape')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('a new onOpenChange on every render keeps the open popover dismissable and in place', () => {
    const calls: boolean[] = []
    function Inline({ n }: { n: number }) {
      return <Example open onOpenChange={(o) => calls.push(o && n > 0)} modal />
    }
    const { rerender } = renderWithTheme(<Inline n={1} />)
    rerender(<Theme appearance="light"><Inline n={2} /></Theme>)
    fireEvent.press(screen.getByTestId('content-backdrop', { includeHiddenElements: true }))
    expect(calls).toEqual([false])
  })

  it('stays hidden until measured', () => {
    renderWithTheme(<Example defaultOpen />)
    expect(flat(screen.getByTestId('content', { includeHiddenElements: true })).opacity).toBe(0)
  })

  it('Close closes it', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<Example onOpenChange={onOpenChange} />)
    fireEvent.press(screen.getByTestId('trigger'))
    layoutContent()
    fireEvent.press(screen.getByTestId('close'))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('non-modal: no backdrop; modal: a backdrop that closes it', () => {
    const onOpenChange = jest.fn()
    const { unmount } = renderWithTheme(<Example defaultOpen />)
    expect(screen.queryByTestId('content-backdrop', { includeHiddenElements: true })).toBeNull()
    unmount()
    renderWithTheme(<Example defaultOpen modal onOpenChange={onOpenChange} />)
    fireEvent.press(screen.getByTestId('content-backdrop', { includeHiddenElements: true }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('an outside touch closes a non-modal popover; a touch inside does not', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<View testID="page"><Example onOpenChange={onOpenChange} /></View>)
    fireEvent.press(screen.getByTestId('trigger'))
    layoutContent()
    touchWindow('page', 60, 150)
    expect(onOpenChange).not.toHaveBeenLastCalledWith(false)
    touchWindow('page', 380, 700)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})
