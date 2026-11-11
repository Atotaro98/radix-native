import React from 'react'
import { Box, Container, Flex, Text } from 'radix-native'
import type { ContainerAlign, ContainerSize } from 'radix-native'
import { ComponentSection } from '../ui'

const SIZES: ContainerSize[] = [1, 2, 3, 4]
const ALIGNS: ContainerAlign[] = ['left', 'center', 'right']

function Content({ label }: { label: string }) {
  return (
    <Box bg="accent-a4" p={3} radius="medium">
      <Text size={2}>{label}</Text>
    </Box>
  )
}

function Sizes() {
  return (
    <Flex gap={3}>
      {SIZES.map(size => (
        <Box key={size} bg="gray-a2">
          <Container size={size}><Content label={`size ${size}`} /></Container>
        </Box>
      ))}
    </Flex>
  )
}

function Align() {
  return (
    <Flex gap={3}>
      {ALIGNS.map(align => (
        <Box key={align} bg="gray-a2">
          <Container align={align} maxWidth={180}><Content label={`align="${align}"`} /></Container>
        </Box>
      ))}
    </Flex>
  )
}

export function ContainerSection() {
  return (
    <ComponentSection
      title="Container"
      tabs={[
        { id: 'sizes', label: 'Sizes', render: () => <Sizes /> },
        { id: 'align', label: 'Align', render: () => <Align /> },
      ]}
    />
  )
}
