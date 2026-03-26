import React from 'react'
import { RadioGroup, Flex, Box, Text, useColor } from 'radix-native'
import type { RadioSize } from 'radix-native'
import { ComponentSection } from '../ui'

const SIZES: RadioSize[] = [1, 2, 3]

function RowLbl({ label }: { label: string }) {
  const color = useColor('gray-11')
  return (
    <Box width={72} flexShrink={0}>
      <Text size={2} style={{ color }}>{label}</Text>
    </Box>
  )
}

export function RadioGroupSection() {
  return (
    <ComponentSection title="Radio Group">
      <Flex gap={4}>
        {SIZES.map(size => (
          <Flex key={size} direction="row" align="start" gap={4}>
            <RowLbl label={`Size ${size}`} />
            <RadioGroup.Root size={size} defaultValue="1">
              <RadioGroup.Item value="1">Agree to Terms and Conditions</RadioGroup.Item>
              <RadioGroup.Item value="2">Disagree with Terms and Conditions</RadioGroup.Item>
            </RadioGroup.Root>
          </Flex>
        ))}
      </Flex>
    </ComponentSection>
  )
}
