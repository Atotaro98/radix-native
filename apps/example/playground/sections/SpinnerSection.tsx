import React from 'react'
import { Spinner, Flex, Text } from 'radix-native'
import type { SpinnerSize } from 'radix-native'
import { ComponentSection } from '../ui'

const SIZES: SpinnerSize[] = [1, 2, 3]

export function SpinnerSection() {
  return (
    <ComponentSection title="Spinner">
      <Flex direction="row" gap={5} align="center">
        {SIZES.map(size => (
          <Flex key={size} align="center" gap={2}>
            <Spinner size={size} />
            <Text size={1} style={{ opacity: 0.5 }}>Size {size}</Text>
          </Flex>
        ))}
      </Flex>
    </ComponentSection>
  )
}
