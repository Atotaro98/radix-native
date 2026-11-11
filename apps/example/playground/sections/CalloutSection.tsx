import React from 'react'
import { Text as RNText, View } from 'react-native'
import { Callout, Flex, Link, Text, useColor } from 'radix-native'
import type { CalloutSize, CalloutVariant } from 'radix-native'
import { ComponentSection, RowLabel } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: CalloutVariant[] = ['soft', 'surface', 'outline']
const SIZES: CalloutSize[] = [1, 2, 3]

/** View-drawn stand-in for Radix's InfoCircledIcon; takes `color` like an SVG with currentColor. */
function InfoCircledIcon({ color, size = 15 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <RNText allowFontScaling={false} style={{ color, fontSize: size * 0.62, fontWeight: '700', lineHeight: size * 0.8 }}>i</RNText>
    </View>
  )
}

function Long() {
  return (
    <Callout.Text>
      We have detected multiple issues in your application configuration file. Please read our{' '}
      <Link onPress={() => {}}>Configuration Guide</Link> for more details.
    </Callout.Text>
  )
}

/** Radix playground sink/callout: each variant, default and high-contrast. */
function Variants() {
  return (
    <Flex gap={5}>
      {VARIANTS.map(variant => (
        <Flex key={variant} gap={2}>
          <RowLabel label={variant} />
          <Callout.Root variant={variant}>
            <Callout.Icon><InfoCircledIcon /></Callout.Icon>
            <Long />
          </Callout.Root>
          <Callout.Root variant={variant} highContrast>
            <Callout.Icon><InfoCircledIcon /></Callout.Icon>
            <Long />
          </Callout.Root>
        </Flex>
      ))}
    </Flex>
  )
}

/** Radix playground sink/callout: each size with a long and a short message. */
function Sizes() {
  return (
    <Flex gap={5}>
      {SIZES.map(size => (
        <Flex key={size} gap={2}>
          <RowLabel label={`size ${size}`} />
          <Callout.Root size={size}>
            <Callout.Icon><InfoCircledIcon size={size === 3 ? 20 : 15} /></Callout.Icon>
            <Long />
          </Callout.Root>
          <Callout.Root size={size}>
            <Callout.Icon><InfoCircledIcon size={size === 3 ? 20 : 15} /></Callout.Icon>
            <Callout.Text>There was an error in your configuration.</Callout.Text>
          </Callout.Root>
        </Flex>
      ))}
    </Flex>
  )
}

/** Radix playground sink/callout: `color` per instance, across variants. */
function Colors() {
  const gray = useColor('gray-11')
  return (
    <Flex gap={4}>
      <Text size={2} style={{ color: gray }}>Color can be set per instance:</Text>
      {ALL_COLORS.map(color => (
        <Flex key={color} gap={2}>
          <RowLabel label={color} />
          {VARIANTS.map(variant => (
            <Callout.Root key={variant} variant={variant} color={color} size={1}>
              <Callout.Icon><InfoCircledIcon /></Callout.Icon>
              <Callout.Text>{variant}: there was an error in your configuration.</Callout.Text>
            </Callout.Root>
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export function CalloutSection() {
  return (
    <ComponentSection
      title="Callout"
      tabs={[
        { id: 'variants', label: 'Variants', render: () => <Variants /> },
        { id: 'sizes', label: 'Sizes', render: () => <Sizes /> },
        { id: 'colors', label: 'All colors', render: () => <Colors /> },
      ]}
    />
  )
}
