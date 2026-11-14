import React from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { Dialog } from '../components/overlays/Dialog'
import { AlertDialog } from '../components/overlays/AlertDialog'
import { Inset } from '../components/layout/Inset'

function Example(props: Partial<React.ComponentProps<typeof Dialog.Root>> & { size?: 1 | 2 | 3 | 4; onEscapeKeyDown?: (e: { preventDefault: () => void }) => void }) {
  const { size, onEscapeKeyDown, ...root } = props
  return (
    <Dialog.Root {...root}>
      <Dialog.Trigger><Pressable testID="open"><Text>Edit profile</Text></Pressable></Dialog.Trigger>
      <Dialog.Content testID="content" size={size} onEscapeKeyDown={onEscapeKeyDown}>
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description>Make changes to your profile.</Dialog.Description>
        <Inset testID="inset"><View /></Inset>
        <Dialog.Close><Pressable testID="close"><Text>Cancel</Text></Pressable></Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  )
}

const modal = () => screen.UNSAFE_getByType(Modal)

describe('Dialog (base-dialog.css)', () => {
  it('opens from the Trigger and closes from Close', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<Example onOpenChange={onOpenChange} />)
    expect(modal().props.visible).toBe(false)
    fireEvent.press(screen.getByTestId('open'))
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(modal().props.visible).toBe(true)
    fireEvent.press(screen.getByTestId('close'))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it.each([[1, 12], [2, 16], [3, 24], [4, 32]] as const)('size %i content padding is %ipx', (size, padding) => {
    renderWithTheme(<Example defaultOpen size={size} />)
    expect(flat(screen.getByTestId('content'))).toMatchObject({ padding, maxWidth: 600, width: '100%' })
  })

  it('publishes its padding to an Inset inside it', () => {
    renderWithTheme(<Example defaultOpen />)
    expect(flat(screen.getByTestId('inset')).marginTop).toBe(-24)
  })

  it('a backdrop press closes it; a press inside the content does not', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<Example defaultOpen onOpenChange={onOpenChange} />)
    const content = screen.getByTestId('content')
    expect(content.props.onStartShouldSetResponder()).toBe(true)
    const backdrop = screen.getByTestId('content-backdrop')
    fireEvent.press(backdrop)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('the Android back button closes it unless onEscapeKeyDown prevents it', () => {
    const onOpenChange = jest.fn()
    const { unmount } = renderWithTheme(<Example defaultOpen onOpenChange={onOpenChange} onEscapeKeyDown={(e) => e.preventDefault()} />)
    act(() => { modal().props.onRequestClose() })
    expect(onOpenChange).not.toHaveBeenCalled()
    unmount()
    renderWithTheme(<Example defaultOpen onOpenChange={onOpenChange} />)
    act(() => { modal().props.onRequestClose() })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('the content is modal for screen readers', () => {
    renderWithTheme(<Example defaultOpen />)
    expect(screen.getByTestId('content').props.accessibilityViewIsModal).toBe(true)
  })
})

describe('AlertDialog', () => {
  function Alert({ onOpenChange, onAction }: { onOpenChange: jest.Mock; onAction: jest.Mock }) {
    return (
      <AlertDialog.Root defaultOpen onOpenChange={onOpenChange}>
        <AlertDialog.Content testID="content">
          <AlertDialog.Title>Revoke access</AlertDialog.Title>
          <AlertDialog.Cancel><Pressable testID="cancel"><Text>Cancel</Text></Pressable></AlertDialog.Cancel>
          <AlertDialog.Action><Pressable testID="action" onPress={onAction}><Text>Revoke</Text></Pressable></AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Root>
    )
  }

  it('ignores backdrop presses and is announced as an alert', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<Alert onOpenChange={onOpenChange} onAction={jest.fn()} />)
    const backdrop = screen.getByTestId('content-backdrop')
    fireEvent.press(backdrop)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('content').props.accessibilityRole).toBe('alert')
  })

  it('Action runs the consumer handler, then closes', () => {
    const onOpenChange = jest.fn()
    const onAction = jest.fn()
    renderWithTheme(<Alert onOpenChange={onOpenChange} onAction={onAction} />)
    fireEvent.press(screen.getByTestId('action'))
    expect(onAction).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})
