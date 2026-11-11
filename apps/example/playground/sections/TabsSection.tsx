import React from 'react'
import { Box, Code, Flex, Tabs, Text, useColor } from 'radix-native'
import type { AccentColor, TabListJustify, TabListSize, TabListWrap } from 'radix-native'
import { ComponentSection, RowLabel } from '../ui'
import { ALL_COLORS } from '../constants'

const SIZES: TabListSize[] = [1, 2]
const NAMES = ['Account', 'Documents', 'Settings']

function Demo(props: { size?: TabListSize; color?: AccentColor; highContrast?: boolean; wrap?: TabListWrap; justify?: TabListJustify }) {
  return (
    <Tabs.Root defaultValue="account" activationMode="manual">
      <Tabs.List {...props}>
        {NAMES.map(name => <Tabs.Trigger key={name} value={name.toLowerCase()}>{name}</Tabs.Trigger>)}
      </Tabs.List>
      {NAMES.map(name => (
        <Tabs.Content key={name} value={name.toLowerCase()}>
          <Box py={5}><Text>{name}</Text></Box>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}

/** Radix playground sink/tabs: each size. */
function Sizes() {
  return (
    <Flex gap={4}>
      {SIZES.map(size => (
        <Box key={size}>
          <RowLabel label={`size ${size}`} />
          <Demo size={size} />
        </Box>
      ))}
    </Flex>
  )
}

/** Radix playground: color per instance, plain and high contrast. */
function Colors() {
  const gray = useColor('gray-11')
  return (
    <Flex gap={4}>
      <Text><Code>color</Code> can be set per instance:</Text>
      {ALL_COLORS.map(color => (
        <Box key={color}>
          <Text size={2} style={{ color: gray }}>{color}</Text>
          <Demo size={1} color={color} />
          <Demo size={1} color={color} highContrast />
        </Box>
      ))}
    </Flex>
  )
}

/** Radix playground: wrap & justify options. */
function Layout() {
  return (
    <Flex gap={4}>
      {(['start', 'center', 'end'] as const).map(justify => (
        <Box key={justify}>
          <RowLabel label={`justify ${justify}`} />
          <Demo justify={justify} />
        </Box>
      ))}
      <Box width={200}>
        <RowLabel label="wrap" />
        <Demo wrap="wrap" />
      </Box>
    </Flex>
  )
}

export function TabsSection() {
  return (
    <ComponentSection
      title="Tabs"
      tabs={[
        { id: 'sizes', label: 'Sizes', render: () => <Sizes /> },
        { id: 'colors', label: 'Colors', render: () => <Colors /> },
        { id: 'layout', label: 'Wrap & justify', render: () => <Layout /> },
      ]}
    />
  )
}
