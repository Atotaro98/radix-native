import React from 'react'
import { Box, Button, ContextMenu, DropdownMenu, Flex, Text, useColor } from 'radix-native'
import type { MenuContentProps, MenuSize, MenuVariant } from 'radix-native'
import { ComponentSection, RowLabel } from '../ui'

const VARIANTS: MenuVariant[] = ['solid', 'soft']
const SIZES: MenuSize[] = [1, 2]

/** Radix playground _components DropdownMenuContentDemo (the solid variant adds checkbox and radio items). */
function ContentDemo(props: MenuContentProps) {
  const [bookmarks, setBookmarks] = React.useState(true)
  const [urls, setUrls] = React.useState(false)
  const [person, setPerson] = React.useState('pedro')
  return (
    <DropdownMenu.Content {...props}>
      <DropdownMenu.Item shortcut="⌘+T">New Tab</DropdownMenu.Item>
      <DropdownMenu.Item shortcut="⌘+N">New Window</DropdownMenu.Item>
      <DropdownMenu.Item shortcut="⇧+⌘+N" disabled>New Private Window</DropdownMenu.Item>
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger>More Tools</DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent>
          <DropdownMenu.Item shortcut="⌘+S">Save Page As…</DropdownMenu.Item>
          <DropdownMenu.Item>Create Shortcut…</DropdownMenu.Item>
          <DropdownMenu.Item>Name Window…</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>Developer Tools</DropdownMenu.Item>
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
      <DropdownMenu.Separator />
      <DropdownMenu.Group>
        <DropdownMenu.Label>Other</DropdownMenu.Label>
        <DropdownMenu.Item shortcut="⌘+P">Print</DropdownMenu.Item>
        <DropdownMenu.Item shortcut="⌘+Q">Logout</DropdownMenu.Item>
      </DropdownMenu.Group>
      {props.variant !== 'soft' ? (
        <>
          <DropdownMenu.Separator />
          <DropdownMenu.CheckboxItem shortcut="⌘+B" checked={bookmarks} onCheckedChange={setBookmarks}>Show Bookmarks</DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem checked={urls} onCheckedChange={setUrls}>Show Full URLs</DropdownMenu.CheckboxItem>
          <DropdownMenu.Separator />
          <DropdownMenu.Label>People</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={person} onValueChange={setPerson}>
            <DropdownMenu.RadioItem value="pedro">Pedro Duarte</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="colm">Colm Tuite</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </>
      ) : null}
    </DropdownMenu.Content>
  )
}

function Menu(props: MenuContentProps & { label?: string }) {
  const { label = 'More', ...content } = props
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger><Button size={content.size} variant="soft" color="gray">{label}</Button></DropdownMenu.Trigger>
      <ContentDemo {...content} />
    </DropdownMenu.Root>
  )
}

/** Radix playground sink/dropdown-menu: each variant × size, then high contrast, gray and gray + high contrast. */
function Variants() {
  return (
    <Flex gap={5}>
      {VARIANTS.map(variant => (
        <Box key={variant}>
          <RowLabel label={variant} />
          <Flex direction="row" gap={3} wrap="wrap" mt={2}>
            {SIZES.map(size => <Menu key={size} label={`size ${size}`} size={size} variant={variant} />)}
            <Menu label="high-contrast" variant={variant} highContrast />
            <Menu label="gray" variant={variant} color="gray" />
            <Menu label="gray + hc" variant={variant} color="gray" highContrast />
          </Flex>
        </Box>
      ))}
    </Flex>
  )
}

/** ContextMenu shares the menu; long-press the area. */
function Context() {
  const border = useColor('gray-a7')
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger style={{ height: 120, borderWidth: 1, borderStyle: 'dashed', borderColor: border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
        <Text size={2}>Long-press here</Text>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item shortcut="⌘ E">Edit</ContextMenu.Item>
        <ContextMenu.Item shortcut="⌘ D">Duplicate</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item shortcut="⌘ N">Archive</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item shortcut="⌘ ⌫" color="red">Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

export function DropdownMenuSection() {
  return (
    <ComponentSection
      title="DropdownMenu"
      tabs={[
        { id: 'variants', label: 'Variants', render: () => <Variants /> },
        { id: 'context', label: 'ContextMenu', render: () => <Context /> },
      ]}
    />
  )
}
