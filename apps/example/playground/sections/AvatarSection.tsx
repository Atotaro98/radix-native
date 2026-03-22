import React from 'react'
import { ScrollView, View } from 'react-native'
import { Avatar, Flex, Box, Text, useResolveColor } from 'radix-native'
import type { AvatarSize, AvatarVariant, AccentColor, RadiusToken } from 'radix-native'
import { ComponentSection } from '../ui'
import { ALL_COLORS } from '../constants'

const VARIANTS: AvatarVariant[] = ['solid', 'soft']
const SIZES: AvatarSize[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
/** Avatar pixel size per token (must match Avatar SIZE_PX) */
const AVATAR_PX: Record<AvatarSize, number> = {
  1: 24, 2: 32, 3: 40, 4: 48, 5: 64, 6: 80, 7: 96, 8: 128, 9: 160,
}
const RADII: { label: string; value: RadiusToken }[] = [
  { label: 'No radius', value: 'none' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'Full', value: 'full' },
]

function photoSrc(seed: number): string {
  return `https://i.pravatar.cc/100?img=${seed}`
}

// ─── Person silhouette icon for fallback demos ──────────────────────────────

function PersonIcon({ color = '#fff', size = 18 }: { color?: string; size?: number }) {
  const headSize = Math.round(size * 0.38)
  const bodyWidth = Math.round(size * 0.62)
  const bodyHeight = Math.round(size * 0.42)
  return (
    <View style={{ alignItems: 'center', width: size, height: size, paddingTop: Math.round(size * 0.12) }}>
      <View style={{
        width: headSize, height: headSize,
        borderRadius: headSize / 2,
        backgroundColor: color,
        marginBottom: Math.round(size * 0.05),
      }} />
      <View style={{
        width: bodyWidth, height: bodyHeight,
        borderTopLeftRadius: bodyWidth / 2,
        borderTopRightRadius: bodyWidth / 2,
        backgroundColor: color,
      }} />
    </View>
  )
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function ColHeader({ label, center }: { label: string; center?: boolean }) {
  const rc = useResolveColor()
  return (
    <Text size={1} weight="medium" style={{ color: rc('gray-9'), textAlign: center ? 'center' : undefined }}>
      {label}
    </Text>
  )
}

function RowLbl({ label }: { label: string }) {
  const rc = useResolveColor()
  return (
    <Box width={72} flexShrink={0}>
      <Text size={2} style={{ color: rc('gray-11') }}>{label}</Text>
    </Box>
  )
}

// ─── Avatar group: photo · V · BG · icon · icon(hc) ─────────────────────────

function AvatarGroup({
  variant,
  color,
  photoSeed,
}: {
  variant: AvatarVariant
  color?: AccentColor
  photoSeed?: number
}) {
  return (
    <Flex direction="row" gap={2} align="center" style={{ flex: 1 }}>
      {photoSeed != null && (
        <Avatar size={3} variant={variant} color={color} src={photoSrc(photoSeed)} fallback="V" />
      )}
      <Avatar size={3} variant={variant} color={color} fallback="V" highContrast />
      <Avatar size={3} variant={variant} color={color} fallback="BG" />
      <Avatar size={3} variant={variant} color={color} fallback={<PersonIcon />} />
      <Avatar size={3} variant={variant} color={color} fallback={<PersonIcon />} highContrast />
    </Flex>
  )
}

// ─── Tab: Theme colors ───────────────────────────────────────────────────────

function ThemeColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Accent" center /></Flex>
          <Flex align="center" style={{ flex: 1 }}><ColHeader label="Gray" center /></Flex>
        </Flex>

        {VARIANTS.map((variant, vi) => (
          <Flex key={variant} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(variant)} />
            <AvatarGroup variant={variant} photoSeed={vi * 10 + 1} />
            <AvatarGroup variant={variant} color="gray" photoSeed={vi * 10 + 5} />
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

// ─── Tab: All colors ─────────────────────────────────────────────────────────

function AllColors() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Flex gap={3}>
        <Flex direction="row" align="center" gap={2}>
          <Box width={72} flexShrink={0} />
          {VARIANTS.map(v => (
            <Flex key={v} align="center" style={{ flex: 1 }}>
              <ColHeader label={capitalize(v)} center />
            </Flex>
          ))}
        </Flex>

        {ALL_COLORS.map((color, ci) => (
          <Flex key={color} direction="row" align="center" gap={2}>
            <RowLbl label={capitalize(color)} />
            <AvatarGroup variant="solid" color={color as AccentColor} photoSeed={(ci % 70) + 1} />
            <AvatarGroup variant="soft" color={color as AccentColor} />
          </Flex>
        ))}
      </Flex>
    </ScrollView>
  )
}

// ─── Tab: All sizes ──────────────────────────────────────────────────────────

function AllSizes() {
  return (
    <Flex gap={6}>
      {VARIANTS.map(variant => (
        <ScrollView key={variant} horizontal showsHorizontalScrollIndicator={false}>
          <Flex gap={3}>
            <Flex direction="row" align="center" gap={2}>
              <Box width={72} flexShrink={0} />
              {RADII.map(r => (
                <Flex key={r.value} minWidth={90} align="start">
                  <ColHeader label={r.label} />
                </Flex>
              ))}
            </Flex>

            {SIZES.map(size => (
              <Flex key={size} direction="row" align="center" gap={2}>
                <RowLbl label={`Size ${size}`} />
                {RADII.map(r => (
                  <Flex key={r.value} minWidth={Math.max(90, AVATAR_PX[size] + 16)} align="start">
                    <Avatar size={size} variant={variant} radius={r.value} fallback="BG" />
                  </Flex>
                ))}
              </Flex>
            ))}
          </Flex>
        </ScrollView>
      ))}
    </Flex>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function AvatarSection() {
  return (
    <ComponentSection
      title="Avatar"
      tabs={[
        { id: 'theme-colors', label: 'Theme colors', render: () => <ThemeColors /> },
        { id: 'all-colors', label: 'All colors', render: () => <AllColors /> },
        { id: 'all-sizes', label: 'All sizes', render: () => <AllSizes /> },
      ]}
    />
  )
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
