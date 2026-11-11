import React from 'react'
import { Box, Code, Flex, TabNav, Text, useColor } from 'radix-native'
import type { AccentColor, TabListSize } from 'radix-native'
import { ComponentSection, RowLabel } from '../ui'
import { ALL_COLORS } from '../constants'

const SIZES: TabListSize[] = [1, 2]
const NAMES = ['Account', 'Documents', 'Settings']

/** Radix playground tab-nav-demo: links whose `active` follows the current "page" (your router's state). */
function Demo(props: { size?: TabListSize; color?: AccentColor; highContrast?: boolean }) {
  const [page, setPage] = React.useState('account')
  return (
    <TabNav.Root accessibilityLabel="Main" {...props}>
      {NAMES.map(name => (
        <TabNav.Link key={name} active={page === name.toLowerCase()} onPress={() => setPage(name.toLowerCase())}>
          {name}
        </TabNav.Link>
      ))}
    </TabNav.Root>
  )
}

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

export function TabNavSection() {
  return (
    <ComponentSection
      title="TabNav"
      tabs={[
        { id: 'sizes', label: 'Sizes', render: () => <Sizes /> },
        { id: 'colors', label: 'Colors', render: () => <Colors /> },
      ]}
    />
  )
}
