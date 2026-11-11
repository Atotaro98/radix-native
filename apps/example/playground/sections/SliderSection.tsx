import React from 'react'
import { Box, Flex, Slider, Text } from 'radix-native'
import type { SliderSize, SliderVariant } from 'radix-native'
import { ComponentSection, RowLabel } from '../ui'

const VARIANTS: SliderVariant[] = ['classic', 'surface', 'soft']
const SIZES: SliderSize[] = [1, 2, 3]

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text size={1}>{label}</Text>
      <Box py={3}>{children}</Box>
    </Box>
  )
}

/** Radix playground sink/slider: each variant with color, high contrast, gray, gray + high contrast, disabled. */
function Variants() {
  return (
    <Flex gap={5}>
      {VARIANTS.map((variant, index) => {
        const value = [33 + index * 10]
        return (
          <Box key={variant}>
            <RowLabel label={variant} />
            <Cell label="color"><Slider variant={variant} defaultValue={value} /></Cell>
            <Cell label="+ high-contrast"><Slider variant={variant} highContrast defaultValue={value} /></Cell>
            <Cell label="gray"><Slider variant={variant} color="gray" defaultValue={value} /></Cell>
            <Cell label="+ high-contrast"><Slider variant={variant} color="gray" highContrast defaultValue={value} /></Cell>
            <Cell label="disabled"><Slider variant={variant} defaultValue={value} disabled /></Cell>
          </Box>
        )
      })}
    </Flex>
  )
}

/** Radix playground: each size, then vertical sliders of every size and variant. */
function Sizes() {
  const verticals = SIZES.flatMap(size => [...VARIANTS, ...VARIANTS].sort().map(variant => ({ size, variant })))
  return (
    <Flex gap={5}>
      {SIZES.map((size, index) => (
        <Cell key={size} label={`size ${size}`}><Slider size={size} defaultValue={[33 + index * 10]} /></Cell>
      ))}
      <Flex direction="row" gap={3} height={160}>
        {verticals.map(({ size, variant }, i) => (
          <Slider
            key={i}
            orientation="vertical"
            size={size}
            variant={variant}
            defaultValue={[Math.round((i / (verticals.length - 1)) * 100)]}
          />
        ))}
      </Flex>
    </Flex>
  )
}

/** Ranges: two thumbs, and minStepsBetweenThumbs. */
function Ranges() {
  return (
    <Flex gap={5}>
      <Cell label="range"><Slider defaultValue={[25, 75]} /></Cell>
      <Cell label="minStepsBetweenThumbs 10"><Slider defaultValue={[25, 75]} minStepsBetweenThumbs={10} /></Cell>
      <Cell label="inverted"><Slider defaultValue={[30]} inverted /></Cell>
    </Flex>
  )
}

export function SliderSection() {
  return (
    <ComponentSection
      title="Slider"
      tabs={[
        { id: 'variants', label: 'Variants', render: () => <Variants /> },
        { id: 'sizes', label: 'Sizes', render: () => <Sizes /> },
        { id: 'ranges', label: 'Ranges', render: () => <Ranges /> },
      ]}
    />
  )
}
