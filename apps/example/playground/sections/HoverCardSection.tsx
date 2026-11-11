import React from 'react'
import { Flex, HoverCard, Link, Text } from 'radix-native'
import { ComponentSection } from '../ui'

/** Radix playground sink/hover-card. On touch: long-press the link. */
function Playground() {
  return (
    <Flex gap={3}>
      <Text size={2}>Long-press the link.</Text>
      <Flex direction="row">
        <HoverCard.Root>
          <HoverCard.Trigger><Link onPress={() => {}}>A fancy link</Link></HoverCard.Trigger>
          <HoverCard.Content width={200}>
            <Text size={2}>
              Jan Tschichold was a German calligrapher, typographer and book designer. He played a significant role in
              the development of graphic design in the 20th century.
            </Text>
          </HoverCard.Content>
        </HoverCard.Root>
      </Flex>
    </Flex>
  )
}

export function HoverCardSection() {
  return <ComponentSection title="HoverCard" tabs={[{ id: 'playground', label: 'Example', render: () => <Playground /> }]} />
}
