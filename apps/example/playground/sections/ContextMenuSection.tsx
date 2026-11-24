import React from 'react'
import { Box, ContextMenu, Flex, Text, useColor } from 'radix-native'
import type { AccentColor, MenuContentProps, MenuSize, MenuVariant } from 'radix-native'
import { ComponentSection, RowLabel } from '../ui'

const VARIANTS: MenuVariant[] = ['solid', 'soft']
const SIZES: MenuSize[] = [1, 2]
const COLORS: AccentColor[] = ['indigo', 'cyan', 'orange', 'crimson']

/** Radix docs RightClickZone: the dashed area that opens the menu (a long-press here). */
function Zone({ label = 'Long-press here', children }: { label?: string; children: React.ReactNode }) {
  const border = useColor('gray-a7')
  const color = useColor('gray-11')
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        style={{
          height: 100,
          flexGrow: 1,
          minWidth: 140,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: border,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text size={2} style={{ color }}>{label}</Text>
      </ContextMenu.Trigger>
      {children}
    </ContextMenu.Root>
  )
}

/** The menu of the Radix docs' main ContextMenu example. */
function FullContent(props: MenuContentProps) {
  return (
    <ContextMenu.Content {...props}>
      <ContextMenu.Item shortcut="⌘ E">Edit</ContextMenu.Item>
      <ContextMenu.Item shortcut="⌘ D">Duplicate</ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item shortcut="⌘ N">Archive</ContextMenu.Item>
      <ContextMenu.Sub>
        <ContextMenu.SubTrigger>More</ContextMenu.SubTrigger>
        <ContextMenu.SubContent>
          <ContextMenu.Item>Move to project…</ContextMenu.Item>
          <ContextMenu.Item>Move to folder…</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item>Advanced options…</ContextMenu.Item>
        </ContextMenu.SubContent>
      </ContextMenu.Sub>
      <ContextMenu.Separator />
      <ContextMenu.Item>Share</ContextMenu.Item>
      <ContextMenu.Item>Add to favorites</ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item shortcut="⌘ ⌫" color="red">Delete</ContextMenu.Item>
    </ContextMenu.Content>
  )
}

/** The short menu the Radix docs use for the size / variant / color examples. */
function ShortContent(props: MenuContentProps) {
  return (
    <ContextMenu.Content {...props}>
      <ContextMenu.Item shortcut="⌘ E">Edit</ContextMenu.Item>
      <ContextMenu.Item shortcut="⌘ D">Duplicate</ContextMenu.Item>
      <ContextMenu.Separator />
      <ContextMenu.Item shortcut="⌘ N">Archive</ContextMenu.Item>
    </ContextMenu.Content>
  )
}

function Example() {
  return (
    <Zone>
      <FullContent />
    </Zone>
  )
}

function Sizes() {
  return (
    <Flex direction="row" gap={3} wrap="wrap">
      {SIZES.map(size => (
        <Zone key={size} label={`size ${size}`}>
          <ShortContent size={size} />
        </Zone>
      ))}
    </Flex>
  )
}

function Variants() {
  return (
    <Flex direction="row" gap={3} wrap="wrap">
      {VARIANTS.map(variant => (
        <Zone key={variant} label={variant}>
          <ShortContent variant={variant} />
        </Zone>
      ))}
    </Flex>
  )
}

function Colors() {
  return (
    <Flex direction="row" gap={3} wrap="wrap">
      {COLORS.map(color => (
        <Zone key={color} label={color}>
          <ShortContent color={color} />
        </Zone>
      ))}
    </Flex>
  )
}

function HighContrast() {
  return (
    <Flex direction="row" gap={3} wrap="wrap">
      <Zone label="default">
        <ShortContent />
      </Zone>
      <Zone label="high-contrast">
        <ShortContent highContrast />
      </Zone>
    </Flex>
  )
}

/** Radix docs "With checkbox / radio items" plus a disabled trigger. */
function Items() {
  const [bookmarks, setBookmarks] = React.useState(true)
  const [urls, setUrls] = React.useState(false)
  const [person, setPerson] = React.useState('pedro')
  const border = useColor('gray-a5')
  const color = useColor('gray-a8')
  return (
    <Flex gap={5}>
      <Box>
        <RowLabel label="checkbox + radio items" />
        <Flex direction="row">
          <Zone>
            <ContextMenu.Content>
              <ContextMenu.Group>
                <ContextMenu.Label>View</ContextMenu.Label>
                <ContextMenu.CheckboxItem shortcut="⌘ B" checked={bookmarks} onCheckedChange={setBookmarks}>Show Bookmarks</ContextMenu.CheckboxItem>
                <ContextMenu.CheckboxItem checked={urls} onCheckedChange={setUrls}>Show Full URLs</ContextMenu.CheckboxItem>
              </ContextMenu.Group>
              <ContextMenu.Separator />
              <ContextMenu.Label>People</ContextMenu.Label>
              <ContextMenu.RadioGroup value={person} onValueChange={setPerson}>
                <ContextMenu.RadioItem value="pedro">Pedro Duarte</ContextMenu.RadioItem>
                <ContextMenu.RadioItem value="colm">Colm Tuite</ContextMenu.RadioItem>
              </ContextMenu.RadioGroup>
              <ContextMenu.Separator />
              <ContextMenu.Item disabled>Disabled item</ContextMenu.Item>
            </ContextMenu.Content>
          </Zone>
        </Flex>
      </Box>
      <Box>
        <RowLabel label="disabled trigger" />
        <ContextMenu.Root>
          <ContextMenu.Trigger
            disabled
            style={{ height: 100, borderWidth: 1, borderStyle: 'dashed', borderColor: border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text size={2} style={{ color }}>Disabled</Text>
          </ContextMenu.Trigger>
          <ShortContent />
        </ContextMenu.Root>
      </Box>
    </Flex>
  )
}

export function ContextMenuSection() {
  return (
    <ComponentSection
      title="ContextMenu"
      tabs={[
        { id: 'example', label: 'Example', render: () => <Flex direction="row"><Example /></Flex> },
        { id: 'size', label: 'Size', render: () => <Sizes /> },
        { id: 'variant', label: 'Variant', render: () => <Variants /> },
        { id: 'color', label: 'Color', render: () => <Colors /> },
        { id: 'high-contrast', label: 'High contrast', render: () => <HighContrast /> },
        { id: 'items', label: 'Items', render: () => <Items /> },
      ]}
    />
  )
}
