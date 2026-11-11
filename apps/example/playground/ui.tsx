/**
 * Shared UI primitives for the playground.
 * Not part of radix-native — only used in the example app.
 */
import React from 'react'
import { Image, Pressable, ScrollView, View } from 'react-native'
import { Box, Flex, Text, Heading, Separator, useColor } from 'radix-native'

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
  const gray12 = useColor('gray-12')
  const gray10 = useColor('gray-10')
  const accent9 = useColor('accent-9')
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
                  style={{ color: isActive ? gray12 : gray10 }}
                >
                  {tab.label}
                </Text>
                <Box
                  height={2}
                  style={{
                    marginTop: 6,
                    borderRadius: 1,
                    backgroundColor: isActive ? accent9 : 'transparent',
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
  const color = useColor('gray-9')
  return (
    <Text
      size={1}
      weight="bold"
      style={{
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
        color,
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
  const color = useColor('gray-9')
  return (
    <Flex direction="row" align="center" gapX={4}>
      <Text size={1} style={{ color, width: labelWidth, flexShrink: 0 }}>
        {label}
      </Text>
      <Box flexGrow={1} flexShrink={1}>
        {children}
      </Box>
    </Flex>
  )
}

/**
 * The Unsplash photos Radix's docs and playground use, bundled in assets/photos so the
 * examples work offline: `house` (sink/aspect-ratio, sink/scroll-area), `book` (the Inset
 * docs example) and `inset` (playground test/inset). Fills its parent, `object-fit: cover`.
 */
const PHOTOS = {
  house: { source: require('../assets/photos/house-forest.jpg'), label: 'A house in a forest' },
  book: { source: require('../assets/photos/inset-docs.jpg'), label: 'Bold typography' },
  inset: { source: require('../assets/photos/inset-test.jpg'), label: 'A sandstone canyon' },
} as const

export type PhotoName = keyof typeof PHOTOS

export function Photo({ name = 'house', height, radius }: { name?: PhotoName; height?: number; radius?: number }) {
  const photo = PHOTOS[name]
  return (
    <Image
      source={photo.source}
      accessibilityLabel={photo.label}
      resizeMode="cover"
      style={{ width: '100%', height: height ?? '100%', borderRadius: radius }}
    />
  )
}
