import React from 'react'
import { Box, Flex, Section, Text } from 'radix-native'
import type { SectionSize } from 'radix-native'
import { ComponentSection } from '../ui'

const SIZES: SectionSize[] = [1, 2, 3, 4]

function Sizes() {
  return (
    <Flex gap={3}>
      {SIZES.map(size => (
        <Box key={size} bg="gray-a2">
          <Section size={size}>
            <Box bg="accent-a4" p={3}><Text size={2}>size {size}</Text></Box>
          </Section>
        </Box>
      ))}
    </Flex>
  )
}

export function SectionSection() {
  return <ComponentSection title="Section" tabs={[{ id: 'sizes', label: 'Sizes', render: () => <Sizes /> }]} />
}
