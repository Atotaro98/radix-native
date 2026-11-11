import React from 'react'
import {
  AspectRatio, Box, Button, Card, CheckboxCards, Flex, Inset, RadioCards, Separator, Strong, Text, useColor,
} from 'radix-native'
import { ComponentSection, Photo } from '../ui'

/** Radix docs: the main Inset example. */
function Docs() {
  return (
    <Box maxWidth={240}>
      <Card size={2}>
        <Inset clip="padding-box" side="top" pb="current">
          <Photo name="book" height={140} />
        </Inset>
        <Text size={3}>
          <Strong>Typography</Strong> is the art and technique of arranging type to make written language legible,
          readable and appealing when displayed.
        </Text>
      </Card>
    </Box>
  )
}

function CardHeader() {
  const gray = useColor('gray-11')
  return (
    <>
      <Text size={5} weight="bold">Title</Text>
      <Text size={2} mb={2} style={{ color: gray }}>Subtitle</Text>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante
        dapibus diam. Sed nisi.
      </Text>
    </>
  )
}

/** Radix playground test/inset: side="bottom" with an image, then side="x" with a Separator. */
function Cards() {
  return (
    <Flex gap={5}>
      <Card size={3}>
        <CardHeader />
        <Inset side="bottom" clip="padding-box" pt="current">
          <AspectRatio ratio={16 / 9}><Photo name="inset" /></AspectRatio>
        </Inset>
      </Card>
      <Card size={3}>
        <CardHeader />
        <Inset side="x" py="current">
          <Separator size={4} />
        </Inset>
        <Flex direction="row" justify="end" gap={4}>
          <Button color="gray" variant="surface">Cancel</Button>
          <Button>Save</Button>
        </Flex>
      </Card>
    </Flex>
  )
}

/** Radix playground test/inset: images bleeding into checkbox and radio cards. */
function SelectionCards() {
  return (
    <Flex gap={5}>
      <CheckboxCards.Root columns={1} defaultValue={['1']} size={3}>
        {['1', '2'].map(v => (
          <CheckboxCards.Item key={v} value={v}>
            <Inset clip="padding-box" side="left" style={{ width: 64 }}>
              <AspectRatio ratio={1}><Photo name="inset" /></AspectRatio>
            </Inset>
            <Text size={4}>Checkbox Card {v}</Text>
          </CheckboxCards.Item>
        ))}
      </CheckboxCards.Root>
      <RadioCards.Root columns={1} defaultValue="1" size={3}>
        {['1', '2'].map(v => (
          <RadioCards.Item key={v} value={v}>
            <Box flexGrow={1}><Text size={4}>Radio Card {v}</Text></Box>
            <Inset clip="padding-box" side="right" style={{ width: 64 }}>
              <AspectRatio ratio={1}><Photo name="inset" /></AspectRatio>
            </Inset>
          </RadioCards.Item>
        ))}
      </RadioCards.Root>
    </Flex>
  )
}

export function InsetSection() {
  return (
    <ComponentSection
      title="Inset"
      tabs={[
        { id: 'docs', label: 'Example', render: () => <Docs /> },
        { id: 'cards', label: 'Cards', render: () => <Cards /> },
        { id: 'selection-cards', label: 'Selection cards', render: () => <SelectionCards /> },
      ]}
    />
  )
}
