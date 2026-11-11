import React from 'react'
import { Box, Flex, Select, Text } from 'radix-native'
import type { SelectContentVariant, SelectSize, SelectTriggerVariant } from 'radix-native'
import { ComponentSection, RowLabel } from '../ui'

const TRIGGER_VARIANTS: SelectTriggerVariant[] = ['surface', 'classic', 'soft', 'ghost']
const CONTENT_VARIANTS: SelectContentVariant[] = ['solid', 'soft']
const SIZES: SelectSize[] = [1, 2, 3]

/** Radix playground _components SelectItemsDemo. */
function ItemsDemo() {
  return (
    <>
      <Select.Group>
        <Select.Label>Fruits</Select.Label>
        <Select.Item value="orange">Orange</Select.Item>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="grapes" disabled>Grape</Select.Item>
      </Select.Group>
      <Select.Separator />
      <Select.Group>
        <Select.Label>Vegetables</Select.Label>
        <Select.Item value="carrot">Carrot</Select.Item>
        <Select.Item value="potato">Potato</Select.Item>
      </Select.Group>
    </>
  )
}

function Demo(props: { size?: SelectSize; variant?: SelectTriggerVariant; color?: 'gray'; placeholder?: string; disabled?: boolean; defaultValue?: string; content?: SelectContentVariant; highContrast?: boolean }) {
  return (
    <Select.Root size={props.size} defaultValue={props.defaultValue} disabled={props.disabled}>
      <Select.Trigger variant={props.variant} color={props.color} placeholder={props.placeholder} />
      <Select.Content variant={props.content} highContrast={props.highContrast}>
        <ItemsDemo />
      </Select.Content>
    </Select.Root>
  )
}

/** Radix playground sink/select: trigger variants by size, placeholder, gray, gray + placeholder, disabled. */
function Triggers() {
  return (
    <Flex gap={5}>
      {TRIGGER_VARIANTS.map(variant => (
        <Box key={variant}>
          <RowLabel label={variant} />
          <Flex direction="row" gap={3} wrap="wrap" align="center" mt={2}>
            {SIZES.map(size => <Demo key={size} size={size} variant={variant} defaultValue="apple" />)}
            <Demo variant={variant} placeholder="Choose a fruit" />
            <Demo variant={variant} color="gray" defaultValue="apple" />
            <Demo variant={variant} color="gray" placeholder="Choose a fruit" />
            <Demo variant={variant} defaultValue="apple" disabled />
          </Flex>
        </Box>
      ))}
    </Flex>
  )
}

/** Radix playground sink/select: content variants, plus high contrast. */
function Content() {
  return (
    <Flex gap={4}>
      <Text size={2}>The list opens with the selected item over the trigger (Radix item-aligned).</Text>
      {CONTENT_VARIANTS.map(variant => (
        <Flex key={variant} direction="row" gap={3} align="center">
          <RowLabel label={variant} />
          <Demo content={variant} defaultValue="apple" />
          <Demo content={variant} highContrast defaultValue="carrot" />
        </Flex>
      ))}
      <Flex direction="row" gap={3} align="center">
        <RowLabel label="popper" />
        <Select.Root defaultValue="apple">
          <Select.Trigger />
          <Select.Content position="popper"><ItemsDemo /></Select.Content>
        </Select.Root>
      </Flex>
    </Flex>
  )
}

export function SelectSection() {
  return (
    <ComponentSection
      title="Select"
      tabs={[
        { id: 'triggers', label: 'Trigger', render: () => <Triggers /> },
        { id: 'content', label: 'Content', render: () => <Content /> },
      ]}
    />
  )
}
