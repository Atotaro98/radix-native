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

// theme-panel.tsx: Scaling is `repeat(3, 1fr)` below the sm breakpoint (phones)
const SCALING_COLUMNS = 3

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
              {/* theme-panel.tsx: Grid columns 2, gap 2; each card 32px, icon + Text size 1 medium */}
              <View role="radiogroup" accessibilityLabel="Appearance" style={styles.row}>
                {(['light', 'dark'] as const).map((value) => (
                  <PanelRadioCard
                    key={value}
                    label={capitalize(value)}
                    checked={appearance === value}
                    onPress={() => onAppearanceChange(value)}
                    style={styles.fill}
                  >
                    <View style={styles.cardContent}>
                      <Text size={1}>{value === 'light' ? '\u2600\uFE0E' : '\u263E\uFE0E'}</Text>
                      <Text size={1} weight="medium">{capitalize(value)}</Text>
                    </View>
                  </PanelRadioCard>
                ))}
              </View>
            </Section>

            <Section label="Radius">
              {/* theme-panel.tsx: Flex wrap gap 2; a card with a 24px corner (m 3), the name below (pt 2, size 1 gray) */}
              <View role="radiogroup" accessibilityLabel="Radius" style={[styles.row, styles.wrap]}>
                {RADIUS_OPTIONS.map((r) => (
                  <View key={r} style={styles.radiusOption}>
                    <PanelRadioCard label={capitalize(r)} checked={radius === r} onPress={() => onRadiusChange(r)}>
                      <RadiusShape token={r} />
                    </PanelRadioCard>
                    <Text size={1} color="gray" style={styles.radiusLabel}>{capitalize(r)}</Text>
                  </View>
                ))}
              </View>
            </Section>

            <Section label="Scaling">
              {/* theme-panel.tsx: Grid repeat(3, 1fr) on phones, gap 2; each value drawn at its own scaling */}
              <View role="radiogroup" accessibilityLabel="Scaling" style={[styles.row, styles.wrap]}>
                {SCALING_OPTIONS.map((value) => (
                  <PanelRadioCard
                    key={value}
                    label={value}
                    checked={scaling === value}
                    onPress={() => onScalingChange(value)}
                    style={styles.scalingCard}
                  >
                    <View style={styles.cardContent}>
                      <Theme scaling={value}>
                        <Text size={1} weight="medium">{value}</Text>
                      </Theme>
                    </View>
                  </PanelRadioCard>
                ))}
              </View>
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

/**
 * `.rt-ThemePanelRadioCard`: radius-1, a 1px gray-7 ring; checked draws a 2px
 * gray-12 outline at offset -1px (theme-panel.css). Announced as a radio.
 */
function PanelRadioCard({
  label, checked, onPress, style, children,
}: { label: string; checked: boolean; onPress: () => void; style?: object; children: React.ReactNode }) {
  const ring = useColor('gray-7')
  const outline = useColor('gray-12')
  const radius = resolveMetrics({ scaling: '100%', radius: 'medium' }).radius(1)
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      style={[{ borderRadius: radius, borderWidth: 1, borderColor: ring }, style]}
    >
      {children}
      {checked ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: -1, left: -1, right: -1, bottom: -1, borderRadius: radius + 1, borderWidth: 2, borderColor: outline }}
        />
      ) : null}
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  wrap: {
    flexWrap: 'wrap',
  },
  fill: {
    flex: 1,
  },
  cardContent: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  radiusOption: {
    alignItems: 'center',
  },
  radiusLabel: {
    paddingTop: 8,
  },
  // 3 columns: (panel content width − 2 gaps) / 3
  scalingCard: {
    width: (PANEL_WIDTH - 2 * 16 - 2 - (SCALING_COLUMNS - 1) * 8) / SCALING_COLUMNS,
  },
  // Box m="3" width/height 24px; top and left 2px accent-a8 edges
  radiusShape: {
    width: 24,
    height: 24,
    margin: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
})
