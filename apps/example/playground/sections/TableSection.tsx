import React from 'react'
import { Box, Flex, Table, Text, useColor } from 'radix-native'
import type { TableSize } from 'radix-native'
import { ComponentSection } from '../ui'

const SIZES: TableSize[] = [1, 2, 3]
const PEOPLE = [
  ['Andy', 'andy@workos.com', 'Developer'],
  ['Benoit', 'benoit@workos.com', 'Admin'],
  ['Lucas', 'lucas@workos.com', 'Developer'],
  ['Vlad', 'vlad@workos.com', 'Designer'],
]

/** Radix playground _components TableExample. */
function TableExample(props: React.ComponentProps<typeof Table.Root> & { noEmail?: boolean }) {
  const { noEmail, ...root } = props
  return (
    <Table.Root {...root}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Full name</Table.ColumnHeaderCell>
          {!noEmail && <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>}
          <Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {PEOPLE.map(([name, email, group]) => (
          <Table.Row key={name}>
            <Table.RowHeaderCell>{name}</Table.RowHeaderCell>
            {!noEmail && <Table.Cell>{email}</Table.Cell>}
            <Table.Cell>{group}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

function Caption({ children }: { children: string }) {
  const gray = useColor('gray-11')
  return <Text size={2} mb={3} style={{ color: gray }}>{children}</Text>
}

/** Radix playground sink/table: surface and ghost. */
function Variants() {
  return (
    <Flex gap={5}>
      <Box><Caption>surface</Caption><TableExample variant="surface" /></Box>
      <Box><Caption>ghost</Caption><TableExample /></Box>
    </Flex>
  )
}

/** Radix playground sink/table: each size, surface, without the email column. */
function Sizes() {
  return (
    <Flex gap={5}>
      {SIZES.map(size => (
        <Box key={size}><Caption>{`size ${size}`}</Caption><TableExample size={size} variant="surface" noEmail /></Box>
      ))}
    </Flex>
  )
}

/** layout="fixed": widths from the first row, the rest shared. */
function Layout() {
  return (
    <Flex gap={5}>
      <Box><Caption>layout auto</Caption><TableExample variant="surface" /></Box>
      <Box>
        <Caption>layout fixed</Caption>
        <Table.Root variant="surface" layout="fixed">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell width="40%">Full name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {PEOPLE.map(([name, , group]) => (
              <Table.Row key={name}>
                <Table.RowHeaderCell>{name}</Table.RowHeaderCell>
                <Table.Cell>{group}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Flex>
  )
}

export function TableSection() {
  return (
    <ComponentSection
      title="Table"
      tabs={[
        { id: 'variants', label: 'Variants', render: () => <Variants /> },
        { id: 'sizes', label: 'Sizes', render: () => <Sizes /> },
        { id: 'layout', label: 'Layout', render: () => <Layout /> },
      ]}
    />
  )
}
