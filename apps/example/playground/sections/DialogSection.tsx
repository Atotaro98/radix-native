import React from 'react'
import { Button, Dialog, Flex, Inset, Table, Text } from 'radix-native'
import type { DialogSize } from 'radix-native'
import { ComponentSection } from '../ui'

const SIZES: DialogSize[] = [1, 2, 3, 4]

/** Radix playground sink/dialog. */
function Playground() {
  return (
    <Dialog.Root>
      <Flex direction="row"><Dialog.Trigger><Button variant="solid">Open</Button></Dialog.Trigger></Flex>
      <Dialog.Content maxWidth={450}>
        <Flex gap={3}>
          <Dialog.Title mb={0}>Share resource</Dialog.Title>
          <Dialog.Description>
            Jan Tschichold was a German calligrapher, typographer and book designer. He played a significant role in
            the development of graphic design in the 20th century.
          </Dialog.Description>
          <Flex direction="row" gap={3} mt={4} justify="end">
            <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
            <Dialog.Close><Button variant="solid">Share</Button></Dialog.Close>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

/** Radix playground test/inset: a table bleeding to the dialog's sides. */
function WithInset() {
  return (
    <Dialog.Root>
      <Flex direction="row"><Dialog.Trigger><Button variant="solid">Dialog</Button></Dialog.Trigger></Flex>
      <Dialog.Content>
        <Dialog.Title>Users</Dialog.Title>
        <Dialog.Description>Here are the users that have access to this project.</Dialog.Description>
        <Inset side="x" my={5}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Full name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row><Table.RowHeaderCell>Andy</Table.RowHeaderCell><Table.Cell>Developer</Table.Cell></Table.Row>
              <Table.Row><Table.RowHeaderCell>Benoit</Table.RowHeaderCell><Table.Cell>Admin</Table.Cell></Table.Row>
            </Table.Body>
          </Table.Root>
        </Inset>
        <Flex direction="row" gap={3} justify="end">
          <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
          <Dialog.Close><Button variant="solid">Share</Button></Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

/** Each size, and align="start". */
function Sizes() {
  return (
    <Flex direction="row" gap={3} wrap="wrap">
      {SIZES.map(size => (
        <Dialog.Root key={size}>
          <Dialog.Trigger><Button variant="soft">Size {size}</Button></Dialog.Trigger>
          <Dialog.Content size={size} maxWidth={400}>
            <Text size={size === 1 ? 2 : 3}>The quick brown fox jumps over the lazy dog.</Text>
          </Dialog.Content>
        </Dialog.Root>
      ))}
      <Dialog.Root>
        <Dialog.Trigger><Button variant="soft">align start</Button></Dialog.Trigger>
        <Dialog.Content align="start" maxWidth={400}>
          <Dialog.Title>Pinned to the top</Dialog.Title>
          <Dialog.Close><Button variant="soft" color="gray">Close</Button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}

export function DialogSection() {
  return (
    <ComponentSection
      title="Dialog"
      tabs={[
        { id: 'playground', label: 'Example', render: () => <Playground /> },
        { id: 'inset', label: 'Inset', render: () => <WithInset /> },
        { id: 'sizes', label: 'Sizes', render: () => <Sizes /> },
      ]}
    />
  )
}
