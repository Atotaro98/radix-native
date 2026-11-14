import React, { useImperativeHandle, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { GestureResponderEvent } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { DropdownMenu } from '../components/overlays/DropdownMenu'
import { ContextMenu } from '../components/overlays/ContextMenu'
import { AccessibleIcon } from '../components/utilities/AccessibleIcon'

function FakeAnchor({ onPress, ref }: { onPress?: (e: GestureResponderEvent) => void; ref?: React.Ref<unknown> }) {
  useImperativeHandle(ref, () => ({ measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(20, 100, 80, 32) }))
  return <Pressable testID="trigger" onPress={onPress}><Text>Options</Text></Pressable>
}

function Example({ onEdit, onOpenChange }: { onEdit?: () => void; onOpenChange?: (o: boolean) => void }) {
  const [bookmarks, setBookmarks] = useState(true)
  const [person, setPerson] = useState('pedro')
  return (
    <DropdownMenu.Root onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger><FakeAnchor /></DropdownMenu.Trigger>
      <DropdownMenu.Content testID="content">
        <DropdownMenu.Item shortcut="⌘ E" onSelect={onEdit} testID="edit">Edit</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={(e) => e.preventDefault()} testID="keep">Keep open</DropdownMenu.Item>
        <DropdownMenu.Item disabled testID="disabled">Disabled</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem checked={bookmarks} onCheckedChange={setBookmarks} testID="bookmarks">Show bookmarks</DropdownMenu.CheckboxItem>
        <DropdownMenu.Label>People</DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={person} onValueChange={setPerson}>
          <DropdownMenu.RadioItem value="pedro" testID="pedro">Pedro</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="colm" testID="colm">Colm</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger testID="more">More</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent testID="sub">
            <DropdownMenu.Item testID="archive">Archive</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

const open = () => {
  fireEvent.press(screen.getByTestId('trigger'))
  act(() => { fireEvent(screen.getByTestId('content', { includeHiddenElements: true }), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 220, height: 300 } } }) })
}
const row = (id: string) => screen.getByTestId(id, { includeHiddenElements: true })

describe('DropdownMenu (base-menu.css)', () => {
  it('opens below the trigger, aligned to its start, 4px away', () => {
    renderWithTheme(<Example />)
    open()
    expect(flat(screen.getByTestId('content'))).toMatchObject({ left: 20, top: 100 + 32 + 4 })
  })

  it('selecting an item calls onSelect and closes the menu', () => {
    const onEdit = jest.fn()
    const onOpenChange = jest.fn()
    renderWithTheme(<Example onEdit={onEdit} onOpenChange={onOpenChange} />)
    open()
    fireEvent.press(row('edit'))
    expect(onEdit).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('preventDefault keeps the menu open', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<Example onOpenChange={onOpenChange} />)
    open()
    fireEvent.press(row('keep'))
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
  })

  it('every row reserves the indicator gutter when the content has checkbox / radio items (size 2: 24px)', () => {
    renderWithTheme(<Example />)
    open()
    expect(flat(row('edit')).paddingLeft).toBe(24)
    expect(row('bookmarks').props.accessibilityState).toMatchObject({ checked: true })
    expect(row('pedro').props.accessibilityState).toMatchObject({ checked: true })
  })

  it('checkbox and radio items update their values (and close)', () => {
    renderWithTheme(<Example />)
    open()
    fireEvent.press(row('colm'))
    open()
    expect(row('colm').props.accessibilityState).toMatchObject({ checked: true })
    fireEvent.press(row('bookmarks'))
    open()
    expect(row('bookmarks').props.accessibilityState).toMatchObject({ checked: false })
  })

  it('size 2 rows are 32px tall; size 1 rows 24px with an 8px left padding when there is no gutter', () => {
    renderWithTheme(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger><FakeAnchor /></DropdownMenu.Trigger>
        <DropdownMenu.Content size={1}><DropdownMenu.Item testID="a">A</DropdownMenu.Item></DropdownMenu.Content>
      </DropdownMenu.Root>,
    )
    expect(flat(row('a'))).toMatchObject({ height: 24, paddingLeft: 8 })
  })

  it('a SubTrigger opens its sub-menu without closing the menu', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<Example onOpenChange={onOpenChange} />)
    open()
    fireEvent.press(row('more'))
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(row('archive')).toBeTruthy()
    expect(row('more').props.accessibilityState).toMatchObject({ expanded: true })
  })

  it('radio items in a sub-menu keep their RadioGroup: its context crosses the portal', () => {
    function Nested() {
      const [person, setPerson] = useState('pedro')
      return (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger><FakeAnchor /></DropdownMenu.Trigger>
          <DropdownMenu.Content testID="content">
            <DropdownMenu.RadioGroup value={person} onValueChange={setPerson}>
              <DropdownMenu.Sub defaultOpen>
                <DropdownMenu.SubTrigger testID="more">People</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent testID="sub">
                  <DropdownMenu.RadioItem value="pedro" testID="pedro">Pedro</DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value="colm" testID="colm">Colm</DropdownMenu.RadioItem>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )
    }
    renderWithTheme(<Nested />)
    open()
    expect(row('pedro').props.accessibilityState).toMatchObject({ checked: true })
    fireEvent.press(row('colm'))
    open()
    expect(row('colm').props.accessibilityState).toMatchObject({ checked: true })
    expect(row('pedro').props.accessibilityState).toMatchObject({ checked: false })
  })

  it('a row is named by its AccessibleIcon label and reads adjacent text as one label', () => {
    renderWithTheme(
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger><FakeAnchor /></DropdownMenu.Trigger>
        <DropdownMenu.Content testID="content">
          <DropdownMenu.Item testID="share">Share <AccessibleIcon label="by email"><View /></AccessibleIcon></DropdownMenu.Item>
          <DropdownMenu.Item testID="greet">Hello {'Ana'}</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    )
    expect(row('share').props.accessibilityLabel).toBe('Share by email')
    expect(screen.getByText('Hello Ana', { includeHiddenElements: true })).toBeTruthy()
  })

  it('a Trigger outside its Root names its own component', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderWithTheme(<DropdownMenu.Trigger><FakeAnchor /></DropdownMenu.Trigger>))
      .toThrow('DropdownMenu.Trigger must be used within DropdownMenu.Root')
    expect(() => renderWithTheme(<ContextMenu.Trigger><Text>Area</Text></ContextMenu.Trigger>))
      .toThrow('ContextMenu.Trigger must be used within ContextMenu.Root')
    jest.restoreAllMocks()
  })

  it('while closing, the menu no longer takes touches (no backdrop, pointerEvents none)', () => {
    renderWithTheme(<Example />)
    open()
    fireEvent.press(row('edit'))
    const content = screen.queryByTestId('content', { includeHiddenElements: true })
    expect(screen.queryByTestId('content-backdrop', { includeHiddenElements: true })).toBeNull()
    // still mounted for its exit animation
    expect(content).not.toBeNull()
    let layer = content!.parent
    while (layer && layer.props.pointerEvents === undefined) layer = layer.parent
    expect(layer?.props.pointerEvents).toBe('none')
  })

  it('a disabled item does nothing', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<Example onOpenChange={onOpenChange} />)
    open()
    fireEvent.press(row('disabled'))
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
  })
})

describe('ContextMenu', () => {
  it('a long-press opens it at the touch point, to the right, first item at the finger', () => {
    renderWithTheme(
      <ContextMenu.Root>
        <ContextMenu.Trigger testID="area"><Text>Right-click here</Text></ContextMenu.Trigger>
        <ContextMenu.Content testID="content"><ContextMenu.Item>Edit</ContextMenu.Item></ContextMenu.Content>
      </ContextMenu.Root>,
    )
    fireEvent(screen.getByTestId('area'), 'longPress', { nativeEvent: { pageX: 120, pageY: 200 } })
    act(() => { fireEvent(screen.getByTestId('content', { includeHiddenElements: true }), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 160, height: 100 } } }) })
    // right / start / sideOffset 2 / alignOffset −4·2
    expect(flat(screen.getByTestId('content'))).toMatchObject({ left: 122, top: 192 })
  })
})
