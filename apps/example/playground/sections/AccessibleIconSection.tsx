import React from 'react'
import { View } from 'react-native'
import { AccessibleIcon, Flex, IconButton, useColor } from 'radix-native'
import { ComponentSection } from '../ui'

/** A View-drawn stand-in for Radix's StarIcon; like an SVG icon with `currentColor`, it defaults to the text color. */
function StarIcon({ color }: { color?: string }) {
  const text = useColor('gray-12')
  color = color ?? text
  return (
    <View style={{ width: 15, height: 15, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 10, height: 10, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
    </View>
  )
}

/** Radix primitive docs: `<AccessibleIcon label="Make favorite"><StarIcon /></AccessibleIcon>`. */
function Docs() {
  return (
    <Flex direction="row" gap={3} align="center">
      <AccessibleIcon label="Make favorite">
        <StarIcon />
      </AccessibleIcon>
      <IconButton variant="soft">
        <AccessibleIcon label="Make favorite">
          <StarIcon />
        </AccessibleIcon>
      </IconButton>
    </Flex>
  )
}

export function AccessibleIconSection() {
  return <ComponentSection title="AccessibleIcon" tabs={[{ id: 'docs', label: 'Example', render: () => <Docs /> }]} />
}
