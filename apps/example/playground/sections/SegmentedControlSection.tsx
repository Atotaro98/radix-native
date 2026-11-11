import React from 'react'
import { Code, Flex, SegmentedControl, Text } from 'radix-native'
import type { RadiusToken, SegmentedControlSize, SegmentedControlVariant } from 'radix-native'
import { ComponentSection, RowLabel } from '../ui'

const VARIANTS: SegmentedControlVariant[] = ['surface', 'classic']
const SIZES: SegmentedControlSize[] = [1, 2, 3]
const RADII: RadiusToken[] = ['none', 'small', 'medium', 'large', 'full']
const COUNTS = [1, 2, 3, 4, 5]
const NAMES = ['One', 'Two', 'Three', 'Four', 'Five']

function Control(props: React.ComponentProps<typeof SegmentedControl.Root> & { count?: number }) {
  const { count = 3, ...root } = props
  return (
    <SegmentedControl.Root {...root}>
      {NAMES.slice(0, count).map((name, i) => (
        <SegmentedControl.Item key={name} value={String(i + 1)}>{name}</SegmentedControl.Item>
      ))}
    </SegmentedControl.Root>
  )
}

/** Radix playground sink/segmented-control: each variant, disabled and every size. */
function Variants() {
  return (
    <Flex gap={5}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={3}>
          <RowLabel label={variant} />
          <Text size={1}>disabled</Text>
          <Control size={1} variant={variant} defaultValue="1" disabled />
          {SIZES.map(size => (
            <Flex key={size} gap={1}>
              <Text size={1}>size {size}</Text>
              <Control size={size} variant={variant} defaultValue="1" />
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

/** Radix playground: radius can be set per instance. */
function Radius() {
  return (
    <Flex gap={4}>
      <Text><Code>radius</Code> can be set per instance:</Text>
      {RADII.map(radius => (
        <Flex key={radius} gap={2}>
          <RowLabel label={radius} />
          {SIZES.map(size => <Control key={size} size={size} radius={radius} defaultValue="1" />)}
        </Flex>
      ))}
    </Flex>
  )
}

/** Radix playground: 1 to 5 items, without and with a value. */
function Counts() {
  return (
    <Flex gap={4}>
      <Flex gap={3}>{COUNTS.map(count => <Control key={count} count={count} />)}</Flex>
      <Flex gap={3}>{COUNTS.map(count => <Control key={count} count={count} defaultValue="1" />)}</Flex>
    </Flex>
  )
}

export function SegmentedControlSection() {
  return (
    <ComponentSection
      title="SegmentedControl"
      tabs={[
        { id: 'variants', label: 'Variants', render: () => <Variants /> },
        { id: 'radius', label: 'Radius', render: () => <Radius /> },
        { id: 'counts', label: 'Items', render: () => <Counts /> },
      ]}
    />
  )
}
