import React from 'react'
import { StyleSheet, Text } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle } from 'react-native'
import { fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { Tabs } from '../components/navigation/Tabs'
import { TabNav } from '../components/navigation/TabNav'

type Node = { type: unknown; props: { style?: unknown }; findAll: (m: (n: Node) => boolean) => Node[] }
const flat = (node: { props: { style?: unknown } }): ViewStyle & TextStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}
const bars = (n: Node) => n.findAll((c) => typeof c.type === 'string' && flat(c).height === 2 && flat(c).position === 'absolute')

function Example(props: React.ComponentProps<typeof Tabs.Root> & { size?: 1 | 2 }) {
  const { size, ...root } = props
  return (
    <Tabs.Root defaultValue="account" {...root}>
      <Tabs.List size={size} testID="list">
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="documents">Documents</Tabs.Trigger>
        <Tabs.Trigger value="settings" disabled>Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account"><Text>Make changes to your account.</Text></Tabs.Content>
      <Tabs.Content value="documents"><Text>Access and update your documents.</Text></Tabs.Content>
      <Tabs.Content value="settings" forceMount><Text>Edit your profile.</Text></Tabs.Content>
    </Tabs.Root>
  )
}

const tab = (name: string) => screen.getByRole('tab', { name })

describe('Tabs (base-tab-list.css)', () => {
  it.each([[1, 32], [2, 40]] as const)('size %i triggers are %ipx tall', (size, height) => {
    renderWithTheme(<Example size={size} />)
    expect(flat(tab('Account')).height).toBe(height)
  })

  it('exposes a tablist; the selected tab is announced and carries the 2px bar', () => {
    renderWithTheme(<Example />)
    expect(screen.getByTestId('list').props.accessibilityRole).toBe('tablist')
    expect(tab('Account').props.accessibilityState).toMatchObject({ selected: true })
    expect(bars(tab('Account') as unknown as Node)).toHaveLength(1)
    expect(bars(tab('Documents') as unknown as Node)).toHaveLength(0)
  })

  it('selects on press and mounts only the selected content (forceMount keeps it hidden)', () => {
    renderWithTheme(<Example />)
    expect(screen.queryByText('Access and update your documents.')).toBeNull()
    fireEvent.press(tab('Documents'))
    expect(screen.getByText('Access and update your documents.')).toBeTruthy()
    expect(screen.queryByText('Make changes to your account.')).toBeNull()
    expect(screen.queryByText('Edit your profile.')).toBeNull()
    expect(screen.getByText('Edit your profile.', { includeHiddenElements: true })).toBeTruthy()
  })

  it('a disabled tab cannot be selected', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Example onValueChange={onValueChange} />)
    fireEvent.press(tab('Settings'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('active text is gray-12 in medium weight, inactive gray-a11 regular', () => {
    renderWithTheme(<Example />)
    const visible = (name: string) => screen.getAllByText(name, { includeHiddenElements: true }).map((t) => flat(t))
    const [, active] = visible('Account')
    const [, inactive] = visible('Documents')
    expect(active.color).not.toBe(inactive.color)
    expect(active.letterSpacing).toBeLessThan(0)
    expect(inactive.letterSpacing).toBe(0)
  })
})

describe('TabNav', () => {
  it('links show `active` and call onPress; no state of their own', () => {
    const onPress = jest.fn()
    renderWithTheme(
      <TabNav.Root accessibilityLabel="Main">
        <TabNav.Link active>Account</TabNav.Link>
        <TabNav.Link onPress={onPress}>Documents</TabNav.Link>
      </TabNav.Root>,
    )
    const docs = screen.getByRole('link', { name: 'Documents' })
    fireEvent.press(docs)
    expect(onPress).toHaveBeenCalled()
    expect(docs.props.accessibilityState).toMatchObject({ selected: false })
    expect(screen.getByRole('link', { name: 'Account' }).props.accessibilityState).toMatchObject({ selected: true })
  })
})
