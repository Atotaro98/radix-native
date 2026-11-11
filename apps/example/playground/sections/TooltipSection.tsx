import React from 'react'
import { Button, Flex, Text, Tooltip } from 'radix-native'
import { ComponentSection } from '../ui'

/** Radix playground sink/tooltip. On touch: long-press a button. */
function Playground() {
  return (
    <Flex gap={3}>
      <Text size={2}>Long-press a button.</Text>
      <Flex direction="row" gap={5}>
        <Tooltip content="The quick brown fox">
          <Button variant="solid" size={1}>Singleline</Button>
        </Tooltip>
        <Tooltip content="The goal of typography is to relate font size, line height, and line width in a proportional way that maximizes beauty and makes reading easier and more pleasant.">
          <Button variant="solid" size={1}>Multiline</Button>
        </Tooltip>
      </Flex>
    </Flex>
  )
}

export function TooltipSection() {
  return <ComponentSection title="Tooltip" tabs={[{ id: 'playground', label: 'Example', render: () => <Playground /> }]} />
}
