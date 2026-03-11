import React from 'react'
import { Box, Flex, Grid, Text, useResolveColor } from 'radix-native'
import type { SpaceToken, GridAlign } from 'radix-native'
import { ComponentSection } from '../ui'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Cell({ label, height }: { label: string; height?: number }) {
  const rc = useResolveColor()
  return (
    <Flex
      align="center"
      justify="center"
      p={3}
      radius="medium"
      bg="accent-a3"
      height={height}
    >
      <Text size={2} weight="medium" style={{ color: rc('accent-11') }}>
        {label}
      </Text>
    </Flex>
  )
}

function SectionLabel({ label }: { label: string }) {
  const rc = useResolveColor()
  return (
    <Text size={1} weight="medium" style={{ color: rc('gray-9'), marginBottom: 4 }}>
      {label}
    </Text>
  )
}

// ─── Columns tab ──────────────────────────────────────────────────────────────

function Columns() {
  return (
    <Flex gap={6}>
      {([1, 2, 3, 4, 6] as const).map((cols) => (
        <Flex key={cols} gap={2}>
          <SectionLabel label={`columns={${cols}}`} />
          <Grid columns={cols} gap={3}>
            {Array.from({ length: cols * 2 }, (_, i) => (
              <Cell key={i} label={`${i + 1}`} />
            ))}
          </Grid>
        </Flex>
      ))}
    </Flex>
  )
}

// ─── Gap tab ──────────────────────────────────────────────────────────────────

function Gaps() {
  const gaps: SpaceToken[] = [1, 2, 3, 4, 5, 6]
  return (
    <Flex gap={6}>
      {gaps.map((g) => (
        <Flex key={g} gap={2}>
          <SectionLabel label={`gap={${g}}`} />
          <Grid columns={3} gap={g}>
            {Array.from({ length: 6 }, (_, i) => (
              <Cell key={i} label={`${i + 1}`} />
            ))}
          </Grid>
        </Flex>
      ))}
    </Flex>
  )
}

// ─── Align tab ────────────────────────────────────────────────────────────────

function Alignment() {
  const aligns: GridAlign[] = ['start', 'center', 'end', 'stretch']
  return (
    <Flex gap={6}>
      {aligns.map((a) => (
        <Flex key={a} gap={2}>
          <SectionLabel label={`align="${a}"`} />
          <Grid columns={3} gap={3} align={a}>
            <Cell label="Short" />
            <Cell label="Taller" height={80} />
            <Cell label="Short" />
          </Grid>
        </Flex>
      ))}
    </Flex>
  )
}

// ─── Real-world example tab ─────────────────────────────────────────────────

function Examples() {
  const rc = useResolveColor()
  return (
    <Flex gap={6}>
      <Flex gap={2}>
        <SectionLabel label="Dashboard cards" />
        <Grid columns={2} gap={3}>
          {['Users', 'Revenue', 'Orders', 'Growth'].map((label) => (
            <Flex key={label} p={4} radius="medium" bg="gray-a2" gap={1}>
              <Text size={1} style={{ color: rc('gray-9') }}>{label}</Text>
              <Text size={5} weight="bold" style={{ color: rc('gray-12') }}>
                {Math.floor(Math.random() * 9000 + 1000)}
              </Text>
            </Flex>
          ))}
        </Grid>
      </Flex>

      <Flex gap={2}>
        <SectionLabel label="Image gallery (3 columns)" />
        <Grid columns={3} gap={2}>
          {Array.from({ length: 9 }, (_, i) => (
            <Box key={i} height={80} radius="small" bg="accent-a3" />
          ))}
        </Grid>
      </Flex>

      <Flex gap={2}>
        <SectionLabel label="Settings grid (mixed content)" />
        <Grid columns={2} gap={3}>
          {['Wi-Fi', 'Bluetooth', 'Cellular', 'VPN', 'Hotspot', 'Airplane'].map((s) => (
            <Flex key={s} direction="row" align="center" gap={2} p={3} radius="medium" bg="gray-a2">
              <Box width={8} height={8} radius="full" bg="accent-9" />
              <Text size={2} style={{ color: rc('gray-12') }}>{s}</Text>
            </Flex>
          ))}
        </Grid>
      </Flex>
    </Flex>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function GridSection() {
  return (
    <ComponentSection
      title="Grid"
      tabs={[
        { id: 'columns',   label: 'Columns',   render: () => <Columns /> },
        { id: 'gaps',      label: 'Gaps',       render: () => <Gaps /> },
        { id: 'alignment', label: 'Alignment',  render: () => <Alignment /> },
        { id: 'examples',  label: 'Examples',   render: () => <Examples /> },
      ]}
    />
  )
}
