import React from 'react'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { focusRings } from './helpers/queries'
import { Tabs } from '../components/navigation/Tabs'
import { SegmentedControl } from '../components/actions/SegmentedControl'
import { Select } from '../components/forms/Select'

/**
 * Controls without a press scale (plain Pressable) still show their focus ring:
 * press feedback and focus are separate (internal/control).
 */
describe('focus ring on controls without a press scale', () => {
  it('tab trigger', () => {
    renderWithTheme(
      <Tabs.Root defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">Account</Tabs.Trigger>
          <Tabs.Trigger value="b" disabled>Billing</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>,
    )
    const tab = () => screen.getByRole('tab', { name: 'Account' })
    expect(focusRings(tab())).toHaveLength(0)
    act(() => fireEvent(tab(), 'focus'))
    expect(focusRings(tab())).toHaveLength(1)
    act(() => fireEvent(tab(), 'blur'))
    expect(focusRings(tab())).toHaveLength(0)

    const disabled = () => screen.getByRole('tab', { name: 'Billing' })
    act(() => fireEvent(disabled(), 'focus'))
    expect(focusRings(disabled())).toHaveLength(0)
  })

  it('SegmentedControl item', () => {
    renderWithTheme(
      <SegmentedControl.Root defaultValue="inbox">
        <SegmentedControl.Item value="inbox">Inbox</SegmentedControl.Item>
        <SegmentedControl.Item value="sent">Sent</SegmentedControl.Item>
      </SegmentedControl.Root>,
    )
    const item = () => screen.getByRole('radio', { name: 'Sent', hidden: true } as never)
    act(() => fireEvent(item(), 'focus'))
    expect(focusRings(item())).toHaveLength(1)
  })

  it('Select trigger', () => {
    renderWithTheme(
      <Select.Root>
        <Select.Trigger testID="trigger" placeholder="Pick a fruit" />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
        </Select.Content>
      </Select.Root>,
    )
    act(() => fireEvent(screen.getByTestId('trigger'), 'focus'))
    expect(focusRings(screen.getByTestId('trigger'))).toHaveLength(1)
  })
})
