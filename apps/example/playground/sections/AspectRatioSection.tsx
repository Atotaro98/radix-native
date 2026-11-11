import React from 'react'
import { AspectRatio, Box, Flex, Text } from 'radix-native'
import { ComponentSection } from '../ui'

const RATIOS: [string, number][] = [['1 / 1', 1], ['16 / 9', 16 / 9], ['16 / 8', 2], ['3 / 4', 3 / 4]]

function Ratios() {
  return (
    <Flex gap={3}>
      {RATIOS.map(([label, ratio]) => (
        <Box key={label} width={ratio < 1 ? 160 : undefined}>
          <AspectRatio ratio={ratio}>
            <Flex flexGrow={1} align="center" justify="center" bg="accent-a4" radius="medium">
              <Text size={2}>{label}</Text>
            </Flex>
          </AspectRatio>
        </Box>
      ))}
    </Flex>
  )
}

export function AspectRatioSection() {
  return <ComponentSection title="AspectRatio" tabs={[{ id: 'ratios', label: 'Ratios', render: () => <Ratios /> }]} />
}
