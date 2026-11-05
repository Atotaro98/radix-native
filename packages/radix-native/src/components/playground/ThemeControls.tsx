import React, { useState } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Theme } from '../../theme/Theme'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useColor } from '../../hooks/useColor'
import { isDev } from '../../utils/env'
import { resolveMetrics } from '../../utils/metrics'
import { Text } from '../typography/Text'
import { Heading } from '../typography/Heading'
import { Button } from '../actions/Button'
import { RadioCards } from '../actions/RadioCards'
import { Flex } from '../layout/Flex'
import type { AccentColor, GrayColor } from '../../tokens/colors/types'
import type { RadiusToken } from '../../tokens/radius'
import type { ScalingMode } from '../../tokens/scaling'
import type { ThemeColor } from '../../theme/theme.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT_COLORS: AccentColor[] = [
  'gray', 'gold', 'bronze', 'brown', 'yellow', 'amber', 'orange',
  'tomato', 'red', 'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet',
  'iris', 'indigo', 'blue', 'cyan', 'teal', 'jade', 'green', 'grass',
  'lime', 'mint', 'sky',
]

const GRAY_OPTIONS: (GrayColor | 'auto')[] = ['auto', 'gray', 'mauve', 'slate', 'sage', 'olive', 'sand']
const RADIUS_OPTIONS: RadiusToken[] = ['none', 'small', 'medium', 'large', 'full']
const SCALING_OPTIONS: ScalingMode[] = ['90%', '95%', '100%', '105%', '110%']

const PANEL_WIDTH = 320

/** Tight cards for the 5-column rows (radius, scaling) of the panel. */
const COMPACT_CARD = { paddingTop: 6, paddingBottom: 6, paddingLeft: 2, paddingRight: 2, alignItems: 'center' } as const

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// ─── ThemeControls ────────────────────────────────────────────────────────────

export interface ThemeControlsProps {
  /** Show the "Copy Theme" button at the bottom */
  showCopyTheme?: boolean
  /** Callback when "Copy Theme" is pressed — receives the config string */
  onCopyTheme?: (config: string) => void
  /** Start with the panel open */
  defaultOpen?: boolean
}

/**
 * Floating panel that edits the root Theme live — radix-native's take on
 * Radix's ThemePanel, built from the library's own components. Its text never
 * grows with accessibility font scaling (a nested Theme caps it at 1), so the
 * fixed-width panel keeps its layout.
 */
export function ThemeControls({ showCopyTheme, onCopyTheme, defaultOpen = false }: ThemeControlsProps = {}) {
  const [open, setOpen] = useState(defaultOpen)
  const slideAnim = useSharedValue(defaultOpen ? 0 : PANEL_WIDTH + 20)
  const { height: windowHeight } = useWindowDimensions()
  const panelBg = useColor('gray-2')
  const panelBorder = useColor('gray-6')

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }))

  const {
    appearance,
    accentColor,
    grayColor,
    resolvedGrayColor,
    radius,
    scaling,
    onAppearanceChange,
    onAccentColorChange,
    onGrayColorChange,
    onRadiusChange,
    onScalingChange,
    isRoot,
  } = useThemeContext()

  React.useEffect(() => {
    if (isDev && !isRoot) {
      console.warn('[radix-native] ThemeControls is inside a nested Theme, where its changes have no effect (as in Radix). Place it directly under the root Theme.')
    }
  }, [isRoot])

  const toggle = () => {
    const toValue = open ? PANEL_WIDTH + 20 : 0
    slideAnim.value = withTiming(toValue, { duration: 250, easing: Easing.out(Easing.ease) })
    setOpen(!open)
  }

  const handleCopyTheme = () => {
    const config = `<Theme accentColor="${accentColor}" grayColor="${grayColor}" appearance="${appearance}" radius="${radius}" scaling="${scaling}">`
    onCopyTheme?.(config)
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Theme maxFontSizeMultiplier={1}>
        {/* "T" toggle button — always visible */}
        <Button size={2} variant="surface" color="gray" highContrast onPress={toggle} accessibilityLabel="Toggle theme panel">
          T
        </Button>

        {/* Sliding panel */}
        <Animated.View style={[styles.panelWrapper, { maxHeight: windowHeight - 120 }, slideStyle]}>
          <ScrollView
            style={[styles.panel, { backgroundColor: panelBg, borderColor: panelBorder }]}
            contentContainerStyle={styles.panelContent}
            showsVerticalScrollIndicator={false}
          >
            <Flex direction="row" align="center" justify="between">
              <Heading size={5}>Theme</Heading>
              <Button size={1} variant="soft" color="gray" highContrast onPress={toggle} accessibilityLabel="Close theme panel">
                T
              </Button>
            </Flex>

            <Section label="Accent color">
              <Swatches
                label="Accent color"
                options={ACCENT_COLORS}
                value={accentColor}
                onValueChange={onAccentColorChange}
                swatch={(c) => `${c}-9`}
              />
            </Section>

            <Section label="Gray color">
              <Swatches
                label="Gray color"
                options={GRAY_OPTIONS}
                value={grayColor}
                onValueChange={onGrayColorChange}
                swatch={(g) => `${g === 'auto' ? resolvedGrayColor : g}-9`}
              />
            </Section>

            <Section label="Appearance">
              <RadioCards
                size={1}
                columns={2}
                gap={2}
                value={appearance}
                onValueChange={(v) => onAppearanceChange(v as 'light' | 'dark')}
                accessibilityLabel="Appearance"
              >
                <RadioCards.Item value="light">{'☀︎  Light'}</RadioCards.Item>
                <RadioCards.Item value="dark">{'☾  Dark'}</RadioCards.Item>
              </RadioCards>
            </Section>

            <Section label="Radius">
              <RadioCards
                size={1}
                columns={5}
                gap={1}
                value={radius}
                onValueChange={(v) => onRadiusChange(v as RadiusToken)}
                accessibilityLabel="Radius"
              >
                {RADIUS_OPTIONS.map((r) => (
                  <RadioCards.Item key={r} value={r} style={COMPACT_CARD}>
                    <RadiusShape token={r} />
                    <Text size={1} align="center" wrap="nowrap">{capitalize(r)}</Text>
                  </RadioCards.Item>
                ))}
              </RadioCards>
            </Section>

            <Section label="Scaling">
              <RadioCards
                size={1}
                columns={5}
                gap={1}
                value={scaling}
                onValueChange={(v) => onScalingChange(v as ScalingMode)}
                accessibilityLabel="Scaling"
              >
                {SCALING_OPTIONS.map((s) => (
                  <RadioCards.Item key={s} value={s} style={COMPACT_CARD}>
                    <Text size={1} align="center">{s}</Text>
                  </RadioCards.Item>
                ))}
              </RadioCards>
            </Section>

            {showCopyTheme && (
              <Button size={2} mt={1} onPress={handleCopyTheme}>
                Copy Theme
              </Button>
            )}
          </ScrollView>
        </Animated.View>
      </Theme>
    </View>
  )
}
ThemeControls.displayName = 'ThemeControls'

// ─── Internal components ──────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex gap={2}>
      <Text size={2} weight="medium">{label}</Text>
      {children}
    </Flex>
  )
}

/**
 * Color swatches as a radio group (Radix ThemePanel draws these by hand too):
 * one ring-wrapped dot per option, the selected one ringed in gray-12.
 */
function Swatches<T extends string>({
  label, options, value, onValueChange, swatch,
}: { label: string; options: T[]; value: T; onValueChange: (v: T) => void; swatch: (v: T) => string }) {
  return (
    <View role="radiogroup" accessibilityLabel={label} style={styles.swatches}>
      {options.map((option) => (
        <Swatch
          key={option}
          label={option}
          color={swatch(option) as ThemeColor}
          selected={value === option}
          onPress={() => onValueChange(option)}
        />
      ))}
    </View>
  )
}

function Swatch({ label, color, selected, onPress }: { label: string; color: ThemeColor; selected: boolean; onPress: () => void }) {
  const fill = useColor(color)
  const ring = useColor('gray-12')
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      style={[styles.swatchRing, selected && { borderColor: ring }]}
    >
      <View style={[styles.swatchDot, { backgroundColor: fill }]} />
    </Pressable>
  )
}

/** A corner drawn at the token's radius-5 (pill for 'full'), as in Radix ThemePanel. */
function RadiusShape({ token }: { token: RadiusToken }) {
  const fill = useColor('accent-4')
  const edge = useColor('accent-a8')
  const r = token === 'full' ? 26 : resolveMetrics({ scaling: '100%', radius: token }).radius(5)
  return (
    <View
      style={[
        styles.radiusShape,
        { backgroundColor: fill, borderTopLeftRadius: r, borderTopColor: edge, borderLeftColor: edge },
      ]}
    />
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    right: 12,
    zIndex: 1000,
    alignItems: 'flex-end',
  },
  panelWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: PANEL_WIDTH,
    marginTop: 44,
  },
  panel: {
    borderRadius: 12,
    borderWidth: 1,
  },
  panelContent: {
    padding: 16,
    rowGap: 14,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  swatchRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  radiusShape: {
    width: 24,
    height: 24,
    marginBottom: 4,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
})
