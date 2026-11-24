import React from 'react'
import { Box, Flex, Text, useColor } from 'radix-native'
import type { FlexAlign, FlexDirection, FlexJustify, FlexWrap, SpaceToken } from 'radix-native'
import { ComponentSection } from '../ui'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Stand-in for the Radix docs' DecorativeBox inside a 64×64 Box. */
function Item({ label, size = 64, height }: { label?: string; size?: number; height?: number }) {
  const color = useColor('accent-11')
  return (
    <Flex align="center" justify="center" width={size} height={height ?? size} radius="small" bg="accent-a4">
      {label ? <Text size={2} weight="medium" style={{ color }}>{label}</Text> : null}
    </Flex>
  )
}

function SectionLabel({ label }: { label: string }) {
  const color = useColor('gray-9')
  return (
    <Text size={1} weight="medium" style={{ color, marginBottom: 4 }}>
      {label}
    </Text>
  )
}

// ─── Direction tab ────────────────────────────────────────────────────────────

function Direction() {
  const directions: FlexDirection[] = ['row', 'column', 'row-reverse', 'column-reverse']
  return (
    <Flex gap={6}>
      {directions.map((direction) => (
        <Flex key={direction} gap={2}>
          <SectionLabel label={`direction="${direction}"${direction === 'column' ? ' (default)' : ''}`} />
          <Flex direction={direction} gap={3}>
            <Item label="1" size={48} />
            <Item label="2" size={48} />
            <Item label="3" size={48} />
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

// ─── Gap tab (Radix docs: <Flex gap="3"> of 64px boxes) ───────────────────────

function Gaps() {
  const gaps: SpaceToken[] = [1, 2, 3, 4, 5, 6]
  return (
    <Flex gap={6}>
      {gaps.map((g) => (
        <Flex key={g} gap={2}>
          <SectionLabel label={`gap={${g}}`} />
          <Flex direction="row" gap={g}>
            <Item size={48} />
            <Item size={48} />
            <Item size={48} />
          </Flex>
        </Flex>
      ))}
      <Flex gap={2}>
        <SectionLabel label="gapX={5} gapY={1}" />
        <Flex direction="row" wrap="wrap" gapX={5} gapY={1} maxWidth={220}>
          {Array.from({ length: 6 }, (_, i) => <Item key={i} size={48} />)}
        </Flex>
      </Flex>
    </Flex>
  )
}

// ─── Align tab ────────────────────────────────────────────────────────────────

function Alignment() {
  const aligns: FlexAlign[] = ['start', 'center', 'end', 'baseline', 'stretch']
  const color = useColor('accent-11')
  return (
    <Flex gap={6}>
      {aligns.map((align) => (
        <Flex key={align} gap={2}>
          <SectionLabel label={`align="${align}"`} />
          <Flex direction="row" gap={3} align={align} height={96} p={2} radius="medium" bg="gray-a3">
            {align === 'baseline' ? (
              <>
                <Text size={2} style={{ color }}>Small</Text>
                <Text size={6} style={{ color }}>Large</Text>
                <Text size={4} style={{ color }}>Medium</Text>
              </>
            ) : (
              <>
                <Box width={48} minHeight={32} radius="small" bg="accent-a4" />
                <Box width={48} minHeight={64} radius="small" bg="accent-a4" />
                <Box width={48} minHeight={48} radius="small" bg="accent-a4" />
              </>
            )}
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

// ─── Justify tab ──────────────────────────────────────────────────────────────

function Justify() {
  const justifies: FlexJustify[] = ['start', 'center', 'end', 'between']
  return (
    <Flex gap={6}>
      {justifies.map((justify) => (
        <Flex key={justify} gap={2}>
          <SectionLabel label={`justify="${justify}"`} />
          <Flex direction="row" gap={3} justify={justify} p={2} radius="medium" bg="gray-a3">
            <Item label="1" size={48} />
            <Item label="2" size={48} />
            <Item label="3" size={48} />
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

// ─── Wrap tab ─────────────────────────────────────────────────────────────────

function Wrap() {
  const wraps: FlexWrap[] = ['nowrap', 'wrap', 'wrap-reverse']
  return (
    <Flex gap={6}>
      {wraps.map((wrap) => (
        <Flex key={wrap} gap={2}>
          <SectionLabel label={`wrap="${wrap}"`} />
          <Flex direction="row" gap={2} wrap={wrap} maxWidth={200} overflow="hidden" p={2} radius="medium" bg="gray-a3">
            {Array.from({ length: 5 }, (_, i) => <Item key={i} label={`${i + 1}`} size={48} />)}
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}

// ─── Examples tab ─────────────────────────────────────────────────────────────

function Examples() {
  const gray11 = useColor('gray-11')
  const gray12 = useColor('gray-12')
  return (
    <Flex gap={6}>
      <Flex gap={2}>
        <SectionLabel label="Radix docs: three 64px boxes, gap 3" />
        <Flex direction="row" gap={3}>
          <Item />
          <Item />
          <Item />
        </Flex>
      </Flex>

      <Flex gap={2}>
        <SectionLabel label="List row (row, align center, justify between)" />
        <Flex direction="row" align="center" justify="between" p={3} radius="medium" bg="gray-a2">
          <Flex direction="row" align="center" gap={3}>
            <Box width={40} height={40} radius="full" bg="accent-9" />
            <Flex gap={1}>
              <Text size={2} weight="bold" style={{ color: gray12 }}>Teodros Girmay</Text>
              <Text size={1} style={{ color: gray11 }}>Engineering</Text>
            </Flex>
          </Flex>
          <Box width={8} height={8} radius="full" bg="accent-9" />
        </Flex>
      </Flex>

      <Flex gap={2}>
        <SectionLabel label="Nested: sidebar + growing content" />
        <Flex direction="row" gap={3} height={120}>
          <Flex gap={2} width={72}>
            <Item size={72} height={36} />
            <Box flexGrow={1} radius="small" bg="accent-a4" />
          </Flex>
          <Flex gap={2} flexGrow={1}>
            <Box flexGrow={1} radius="small" bg="accent-a4" />
            <Box height={24} radius="small" bg="accent-a4" />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function FlexSection() {
  return (
    <ComponentSection
      title="Flex"
      tabs={[
        { id: 'direction', label: 'Direction', render: () => <Direction /> },
        { id: 'gap',       label: 'Gap',       render: () => <Gaps /> },
        { id: 'align',     label: 'Align',     render: () => <Alignment /> },
        { id: 'justify',   label: 'Justify',   render: () => <Justify /> },
        { id: 'wrap',      label: 'Wrap',      render: () => <Wrap /> },
        { id: 'examples',  label: 'Examples',  render: () => <Examples /> },
      ]}
    />
  )
}
