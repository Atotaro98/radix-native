/**
 * Shared UI primitives for the playground.
 * Not part of radix-native — only used in the example app.
 */
import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { Box, Flex, Text, Heading, Separator, useResolveColor } from 'radix-native'

// ─── Tab system ───────────────────────────────────────────────────────────────

export type TabDef = {
  id: string
  label: string
  render: () => React.ReactNode
}

export function ComponentSection({
  title,
  tabs,
  children,
}: {
  title: string
  tabs?: TabDef[]
  children?: React.ReactNode
}) {
  const rc = useResolveColor()
  const [active, setActive] = React.useState(tabs?.[0]?.id ?? '')
  const activeTab = tabs?.find((t) => t.id === active) ?? tabs?.[0]

  return (
    <Box mb={8}>
      <Heading size={6} style={{ marginBottom: 12 }}>
        {title}
      </Heading>

      {tabs && tabs.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexDirection: 'row' }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === active
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActive(tab.id)}
                style={{ paddingBottom: 8, marginRight: 24 }}
              >
                <Text
                  size={2}
                  weight="medium"
                  style={{ color: isActive ? rc('gray-12') : rc('gray-10') }}
                >
                  {tab.label}
                </Text>
                <Box
                  height={2}
                  style={{
                    marginTop: 6,
                    borderRadius: 1,
                    backgroundColor: isActive ? rc('accent-9') : 'transparent',
                  }}
                />
              </Pressable>
            )
          })}
        </ScrollView>
      )}

      <Separator mb={5} size={4} />
      <Box width="100%">{activeTab ? activeTab.render() : children}</Box>
    </Box>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

/** Small uppercase label used inside tab content */
export function RowLabel({ label }: { label: string }) {
  const rc = useResolveColor()
  return (
    <Text
      size={1}
      weight="bold"
      style={{
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
        color: rc('gray-9'),
      }}
    >
      {label}
    </Text>
  )
}

/**
 * Row with a fixed-width gray label on the left and the component on the right.
 * Matches the layout used in Radix's "All sizes" and "All weights" tabs.
 */
export function LabeledRow({
  label,
  labelWidth = 72,
  children,
}: {
  label: string
  labelWidth?: number
  children: React.ReactNode
}) {
  const rc = useResolveColor()
  return (
    <Flex direction="row" align="center" gapX={4}>
      <Text size={1} style={{ color: rc('gray-9'), width: labelWidth, flexShrink: 0 }}>
        {label}
      </Text>
      <Box flexGrow={1} flexShrink={1}>
        {children}
      </Box>
    </Flex>
  )
}
