import React from 'react'
import { Card, Flex, Box, Text, useResolveColor } from 'radix-native'
import type { CardSize, CardVariant } from 'radix-native'
import { ComponentSection, LabeledRow } from '../ui'

const VARIANTS: CardVariant[] = ['surface', 'classic', 'ghost']
const SIZES: CardSize[] = [1, 2, 3, 4, 5]

function RowLbl({ label }: { label: string }) {
  const rc = useResolveColor()
  return (
    <Box width={72} flexShrink={0}>
      <Text size={2} style={{ color: rc('gray-11') }}>{label}</Text>
    </Box>
  )
}

function Specimen() {
  return (
    <Flex gap={4}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={2}>
          <Text size={1} weight="bold" style={{ textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.5 }}>
            {variant}
          </Text>
          <Card variant={variant} size={2}>
            <Flex gap={2}>
              <Text size={2} weight="bold">Card title</Text>
              <Text size={2}>This is a {variant} card with some example content inside it.</Text>
            </Flex>
          </Card>
        </Flex>
      ))}
    </Flex>
  )
}

function AllSizes() {
  return (
    <Flex gap={5}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={3}>
          <Text size={1} weight="bold" style={{ textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.5 }}>
            {variant}
          </Text>
          {SIZES.map(size => (
            <Card key={size} variant={variant} size={size}>
              <Text size={2}>Size {size}</Text>
            </Card>
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

function Interactive() {
  const [pressed, setPressed] = React.useState('')
  return (
    <Flex gap={4}>
      {VARIANTS.map(variant => (
        <Card key={variant} variant={variant} size={2} onPress={() => setPressed(variant)}>
          <Flex gap={1}>
            <Text size={2} weight="bold">Pressable {variant}</Text>
            <Text size={2}>{pressed === variant ? 'Pressed!' : 'Tap this card'}</Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  )
}

export function CardSection() {
  return (
    <ComponentSection
      title="Card"
      tabs={[
        { id: 'example',  label: 'Example',  render: () => <Specimen /> },
        { id: 'all-sizes', label: 'All sizes', render: () => <AllSizes /> },
        { id: 'interactive', label: 'Interactive', render: () => <Interactive /> },
      ]}
    />
  )
}
