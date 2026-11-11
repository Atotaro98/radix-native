import React from 'react'
import { Button, Dialog, Flex, Popover, Text } from 'radix-native'
import { ComponentSection } from '../ui'

/** Radix playground sink/popover. */
function Playground() {
  return (
    <Flex direction="row">
      <Popover.Root>
        <Popover.Trigger><Button variant="solid">Popover</Button></Popover.Trigger>
        <Popover.Content width={200}>
          <Text size={2} mb={2}>
            Jan Tschichold was a German calligrapher, typographer and book designer. He played a significant role in
            the development of graphic design in the 20th century.
          </Text>
          <Flex direction="row">
            <Popover.Close><Button variant="solid" size={1}>Share</Button></Popover.Close>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  )
}

/** Inside a Dialog: the popover draws above it (the Dialog's own portal host). */
function InDialog() {
  return (
    <Flex direction="row">
      <Dialog.Root>
        <Dialog.Trigger><Button variant="soft">Open dialog</Button></Dialog.Trigger>
        <Dialog.Content maxWidth={400}>
          <Dialog.Title>Dialog with a popover</Dialog.Title>
          <Flex direction="row" gap={3}>
            <Popover.Root>
              <Popover.Trigger><Button variant="solid">Popover</Button></Popover.Trigger>
              <Popover.Content width={200}>
                <Text size={2}>Drawn above the dialog.</Text>
              </Popover.Content>
            </Popover.Root>
            <Dialog.Close><Button variant="soft" color="gray">Close</Button></Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}

export function PopoverSection() {
  return (
    <ComponentSection
      title="Popover"
      tabs={[
        { id: 'playground', label: 'Example', render: () => <Playground /> },
        { id: 'dialog', label: 'In a Dialog', render: () => <InDialog /> },
      ]}
    />
  )
}
