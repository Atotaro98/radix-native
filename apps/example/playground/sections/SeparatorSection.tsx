import React from 'react'
import { Separator, Flex, Text } from 'radix-native'
import type { AccentColor } from 'radix-native'
import { ComponentSection } from '../ui'

// ─── Hero: realistic usage example ──────────────────────────────────────────

function Hero() {
  return (
    <Flex gap={4}>
      <Text size={3}>Tools for building high-quality, accessible UI.</Text>
      <Separator size={4} color="gray" />
      <Flex direction="row" align="center" gap={3}>
        <Text size={2}>Themes</Text>
        <Separator orientation="vertical" size={2} color="gray" />
        <Text size={2}>Primitives</Text>
        <Separator orientation="vertical" size={2} color="gray" />
        <Text size={2}>Icons</Text>
        <Separator orientation="vertical" size={2} color="gray" />
        <Text size={2}>Colors</Text>
      </Flex>
    </Flex>
  )
}

// ─── Size ────────────────────────────────────────────────────────────────────

function SizeExamples() {
  return (
    <Flex gap={5}>
      <Flex gap={4}>
        <Separator size={1} />
        <Separator size={2} />
        <Separator size={3} />
        <Separator size={4} />
      </Flex>

      <Flex direction="row" gap={4} align="stretch" style={{ height: 80 }}>
        <Separator orientation="vertical" size={1} />
        <Separator orientation="vertical" size={2} />
        <Separator orientation="vertical" size={3} />
        <Separator orientation="vertical" size={4} />
      </Flex>
    </Flex>
  )
}

// ─── Color ───────────────────────────────────────────────────────────────────

function ColorExamples() {
  const colors: AccentColor[] = ['indigo', 'cyan', 'orange', 'crimson']
  return (
    <Flex gap={4}>
      {colors.map(color => (
        <Separator key={color} size={4} color={color} />
      ))}
    </Flex>
  )
}

// ─── Orientation ─────────────────────────────────────────────────────────────

function OrientationExamples() {
  return (
    <Flex gap={4}>
      <Separator size={4} />
      <Flex style={{ height: 40 }}>
        <Separator orientation="vertical" size={4} />
      </Flex>
    </Flex>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function SeparatorSection() {
  return (
    <ComponentSection
      title="Separator"
      tabs={[
        { id: 'example', label: 'Example', render: () => <Hero /> },
        { id: 'size', label: 'Size', render: () => <SizeExamples /> },
        { id: 'color', label: 'Color', render: () => <ColorExamples /> },
        { id: 'orientation', label: 'Orientation', render: () => <OrientationExamples /> },
      ]}
    />
  )
}
