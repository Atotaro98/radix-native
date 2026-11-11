import React from 'react'
import { Box, Card, Flex, Inset, Text } from 'radix-native'
import type { InsetClip, InsetSide } from 'radix-native'
import { ComponentSection } from '../ui'

const SIDES: InsetSide[] = ['top', 'bottom', 'left', 'right', 'x', 'y', 'all']
const CLIPS: InsetClip[] = ['border-box', 'padding-box']

/** Stands in for the image in Radix's docs example. */
function Media({ height = 96 }: { height?: number }) {
  return <Box bg="accent-a5" height={height} />
}

function Specimen() {
  return (
    <Card size={2} style={{ maxWidth: 260 }}>
      <Inset clip="padding-box" side="top" pb="current">
        <Media height={140} />
      </Inset>
      <Text size={3}>
        <Text weight="bold">Typography</Text> is the art and technique of arranging type to make written language legible.
      </Text>
    </Card>
  )
}

function AllSides() {
  return (
    <Flex gap={3}>
      {SIDES.map(side => (
        <Card key={side} size={2}>
          <Flex direction={side === 'left' || side === 'right' || side === 'x' ? 'row' : 'column'} gap={3}>
            {side === 'right' || side === 'bottom' ? <Text size={2}>side="{side}"</Text> : null}
            <Inset side={side} style={{ flexGrow: side === 'x' || side === 'left' || side === 'right' ? 0 : undefined }}>
              <Box bg="accent-a5" width={side === 'left' || side === 'right' ? 64 : undefined} height={48} />
            </Inset>
            {side !== 'right' && side !== 'bottom' ? <Text size={2}>side="{side}"</Text> : null}
          </Flex>
        </Card>
      ))}
    </Flex>
  )
}

function Clip() {
  return (
    <Flex gap={3}>
      {CLIPS.map(clip => (
        <Card key={clip} size={2} variant="classic">
          <Inset clip={clip} side="top" pb="current">
            <Media />
          </Inset>
          <Text size={2}>clip="{clip}"</Text>
        </Card>
      ))}
    </Flex>
  )
}

export function InsetSection() {
  return (
    <ComponentSection
      title="Inset"
      tabs={[
        { id: 'example', label: 'Example', render: () => <Specimen /> },
        { id: 'sides', label: 'Sides', render: () => <AllSides /> },
        { id: 'clip', label: 'Clip', render: () => <Clip /> },
      ]}
    />
  )
}
