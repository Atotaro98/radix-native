import React from 'react'
import { Box, Button, Code, DataList, Flex, Link, Text, useColor } from 'radix-native'
import type { DataListOrientation, DataListSize } from 'radix-native'
import { ComponentSection, RowLabel } from '../ui'
import { ALL_COLORS } from '../constants'

const ORIENTATIONS: DataListOrientation[] = ['horizontal', 'vertical']
const SIZES: DataListSize[] = [1, 2, 3]

function NameEmail(props: React.ComponentProps<typeof DataList.Root> & { color?: React.ComponentProps<typeof DataList.Label>['color']; highContrast?: boolean }) {
  const { color, highContrast, ...root } = props
  return (
    <DataList.Root my={3} {...root}>
      <DataList.Item>
        <DataList.Label color={color} highContrast={highContrast}>Name</DataList.Label>
        <DataList.Value>Susan Kare</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label color={color} highContrast={highContrast}>Email</DataList.Label>
        <DataList.Value>susan.kare@apple.com</DataList.Value>
      </DataList.Item>
    </DataList.Root>
  )
}

/** Radix playground sink/data-list: Specimen tab. */
function Specimen() {
  return (
    <Box my={6}>
      <DataList.Root>
        <DataList.Item>
          <DataList.Label width={200}>Name</DataList.Label>
          <DataList.Value>Susan Kare</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Email</DataList.Label>
          <DataList.Value>susan.kare@apple.com</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Status</DataList.Label>
          <DataList.Value><Button color="green" size={1}>Active</Button></DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Bio</DataList.Label>
          <DataList.Value>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac nisl et libero ultricies viverra quis
            vitae quam. Proin a feugiat metus.
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>Organization</DataList.Label>
          <DataList.Value><Link onPress={() => {}}>WorkOS</Link></DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </Box>
  )
}

/** Radix playground sink/data-list: All orientations tab. */
function Orientations() {
  return (
    <Flex gap={4} my={6}>
      {ORIENTATIONS.map(orientation => (
        <Box key={orientation}>
          <RowLabel label={orientation} />
          <NameEmail orientation={orientation} />
        </Box>
      ))}
    </Flex>
  )
}

/** Radix playground sink/data-list: All sizes tab. */
function Sizes() {
  return (
    <Flex gap={4} my={6}>
      {SIZES.map(size => (
        <Box key={size}>
          <RowLabel label={`Size ${size}`} />
          <NameEmail size={size} />
        </Box>
      ))}
    </Flex>
  )
}

/** Radix playground sink/data-list: color per DataList.Label, plain and high contrast. */
function Colors() {
  const gray = useColor('gray-11')
  return (
    <Flex gap={4}>
      <Text>
        <Code>color</Code> can be set per <Code>DataListLabel</Code> instance:
      </Text>
      {ALL_COLORS.map(color => (
        <Box key={color}>
          <Text size={2} style={{ color: gray }}>{color}</Text>
          <NameEmail color={color} />
          <NameEmail color={color} highContrast />
        </Box>
      ))}
    </Flex>
  )
}

export function DataListSection() {
  return (
    <ComponentSection
      title="DataList"
      tabs={[
        { id: 'specimen', label: 'Specimen', render: () => <Specimen /> },
        { id: 'orientations', label: 'All orientations', render: () => <Orientations /> },
        { id: 'sizes', label: 'All sizes', render: () => <Sizes /> },
        { id: 'colors', label: 'Colors', render: () => <Colors /> },
      ]}
    />
  )
}
