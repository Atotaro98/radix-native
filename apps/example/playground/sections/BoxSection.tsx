import React from 'react'
import { Box, Flex, Text, useColor } from 'radix-native'
import type { RadiusToken, SpaceToken } from 'radix-native'
import { ComponentSection } from '../ui'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Stand-in for the Radix docs' DecorativeBox: a tinted block that fills its parent. */
function DecorativeBox({ label }: { label?: string }) {
  const color = useColor('accent-11')
  return (
    <Flex align="center" justify="center" flexGrow={1} minHeight={16} radius="small" bg="accent-a4">
      {label ? <Text size={1} weight="medium" style={{ color }}>{label}</Text> : null}
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

// ─── Size tab (Radix docs: <Box width="64px" height="64px">) ──────────────────

function Sizes() {
  return (
    <Flex gap={6}>
      <Flex gap={2}>
        <SectionLabel label="width={64} height={64}" />
        <Box width={64} height={64}>
          <DecorativeBox />
        </Box>
      </Flex>
      <Flex gap={2}>
        <SectionLabel label='width="100%" height={48}' />
        <Box width="100%" height={48}>
          <DecorativeBox />
        </Box>
      </Flex>
      <Flex gap={2}>
        <SectionLabel label='width="50%" minHeight={64}' />
        <Box width="50%" minHeight={64}>
          <DecorativeBox />
        </Box>
      </Flex>
      <Flex gap={2}>
        <SectionLabel label='width="100%" maxWidth={160}' />
        <Box width="100%" maxWidth={160} height={48}>
          <DecorativeBox />
        </Box>
      </Flex>
    </Flex>
  )
}

// ─── Padding tab ──────────────────────────────────────────────────────────────

function Padding() {
  const tokens: SpaceToken[] = [1, 2, 3, 4, 5, 6]
  return (
    <Flex gap={6}>
      {tokens.map((p) => (
        <Flex key={p} gap={2}>
          <SectionLabel label={`p={${p}}`} />
          <Box p={p} radius="medium" bg="gray-a3">
            <DecorativeBox />
          </Box>
        </Flex>
      ))}
      <Flex gap={2}>
        <SectionLabel label="px={6} py={2}" />
        <Box px={6} py={2} radius="medium" bg="gray-a3">
          <DecorativeBox />
        </Box>
      </Flex>
      <Flex gap={2}>
        <SectionLabel label="pt={5} pl={5} (sides override axes)" />
        <Box p={1} pt={5} pl={5} radius="medium" bg="gray-a3">
          <DecorativeBox />
        </Box>
      </Flex>
    </Flex>
  )
}

// ─── Margin tab ───────────────────────────────────────────────────────────────

function Margin() {
  return (
    <Flex gap={6}>
      {([2, 4, 6] as const).map((m) => (
        <Flex key={m} gap={2}>
          <SectionLabel label={`m={${m}}`} />
          <Box radius="medium" bg="gray-a3">
            <Box m={m} height={32}>
              <DecorativeBox />
            </Box>
          </Box>
        </Flex>
      ))}
      <Flex gap={2}>
        <SectionLabel label="mx={6}" />
        <Box radius="medium" bg="gray-a3">
          <Box mx={6} height={32}>
            <DecorativeBox />
          </Box>
        </Box>
      </Flex>
      <Flex gap={2}>
        <SectionLabel label="mt={5} ml={5}" />
        <Box radius="medium" bg="gray-a3">
          <Box mt={5} ml={5} height={32}>
            <DecorativeBox />
          </Box>
        </Box>
      </Flex>
    </Flex>
  )
}

// ─── Position tab ─────────────────────────────────────────────────────────────

function Position() {
  return (
    <Flex gap={6}>
      <Flex gap={2}>
        <SectionLabel label='position="absolute" in the four corners' />
        <Box position="relative" height={120} radius="medium" bg="gray-a3">
          <Box position="absolute" top={8} left={8} width={32} height={32}><DecorativeBox /></Box>
          <Box position="absolute" top={8} right={8} width={32} height={32}><DecorativeBox /></Box>
          <Box position="absolute" bottom={8} left={8} width={32} height={32}><DecorativeBox /></Box>
          <Box position="absolute" bottom={8} right={8} width={32} height={32}><DecorativeBox /></Box>
        </Box>
      </Flex>
      <Flex gap={2}>
        <SectionLabel label='overflow="hidden"' />
        <Box overflow="hidden" height={64} radius="medium" bg="gray-a3">
          <Box position="absolute" top={-16} left={-16} width={64} height={64}><DecorativeBox /></Box>
        </Box>
      </Flex>
    </Flex>
  )
}

// ─── Flex child tab ───────────────────────────────────────────────────────────

function FlexChild() {
  return (
    <Flex gap={6}>
      <Flex gap={2}>
        <SectionLabel label="flexGrow={1} next to a fixed Box" />
        <Flex direction="row" gap={3} height={48}>
          <Box width={64}><DecorativeBox /></Box>
          <Box flexGrow={1}><DecorativeBox label="grow" /></Box>
        </Flex>
      </Flex>
      <Flex gap={2}>
        <SectionLabel label='flexBasis="50%" / flexShrink={0}' />
        <Flex direction="row" gap={3} height={48}>
          <Box flexBasis="50%" flexShrink={0}><DecorativeBox label="50%" /></Box>
          <Box flexGrow={1}><DecorativeBox /></Box>
        </Flex>
      </Flex>
    </Flex>
  )
}

// ─── Theme tab (RN-only bg / radius) ──────────────────────────────────────────

function ThemeProps() {
  const radii: RadiusToken[] = ['none', 'small', 'medium', 'large', 'full']
  return (
    <Flex gap={6}>
      <Flex gap={2}>
        <SectionLabel label="bg (theme color token)" />
        <Flex direction="row" gap={3} wrap="wrap">
          <Box width={48} height={48} bg="accent-3" />
          <Box width={48} height={48} bg="accent-6" />
          <Box width={48} height={48} bg="accent-9" />
          <Box width={48} height={48} bg="gray-a3" />
          <Box width={48} height={48} bg="gray-a6" />
        </Flex>
      </Flex>
      <Flex gap={2}>
        <SectionLabel label="radius" />
        <Flex direction="row" gap={3} wrap="wrap">
          {radii.map((radius) => (
            <Box key={radius} width={48} height={48} radius={radius} bg="accent-a4" />
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function BoxSection() {
  return (
    <ComponentSection
      title="Box"
      tabs={[
        { id: 'size',     label: 'Size',       render: () => <Sizes /> },
        { id: 'padding',  label: 'Padding',    render: () => <Padding /> },
        { id: 'margin',   label: 'Margin',     render: () => <Margin /> },
        { id: 'position', label: 'Position',   render: () => <Position /> },
        { id: 'flex',     label: 'Flex child', render: () => <FlexChild /> },
        { id: 'theme',    label: 'Theme',      render: () => <ThemeProps /> },
      ]}
    />
  )
}
