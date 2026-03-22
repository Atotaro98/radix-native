import React, { useState } from 'react'
import { Animated, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import type { ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { Text } from '../typography/Text'
import { Heading } from '../typography/Heading'
import { getRadius } from '../../tokens/radius'
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

const PANEL_WIDTH = 280

// ─── ThemeControls ────────────────────────────────────────────────────────────

export interface ThemeControlsProps {
  /** Show the "Copy Theme" button at the bottom */
  showCopyTheme?: boolean
  /** Callback when "Copy Theme" is pressed — receives the config string */
  onCopyTheme?: (config: string) => void
  /** Start with the panel open */
  defaultOpen?: boolean
}

export function ThemeControls({ showCopyTheme, onCopyTheme, defaultOpen = false }: ThemeControlsProps = {}) {
  const [open, setOpen] = useState(defaultOpen)
  const slideAnim = React.useRef(new Animated.Value(defaultOpen ? 0 : PANEL_WIDTH + 20)).current
  const { height: windowHeight } = useWindowDimensions()

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
  } = useThemeContext()

  const rc = useResolveColor()

  const toggle = () => {
    const toValue = open ? PANEL_WIDTH + 20 : 0
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start()
    setOpen(!open)
  }

  const handleCopyTheme = () => {
    const config = `<Theme accentColor="${accentColor}" grayColor="${grayColor}" appearance="${appearance}" radius="${radius}" scaling="${scaling}">`
    onCopyTheme?.(config)
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* "T" toggle button — always visible */}
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel="Toggle theme panel"
        style={[
          styles.toggleButton,
          {
            backgroundColor: rc('gray-2'),
            borderColor: rc('gray-6'),
          },
        ]}
      >
        <Text size={2} weight="bold" style={{ color: rc('gray-12') }}>T</Text>
      </Pressable>

      {/* Sliding panel */}
      <Animated.View
        style={[
          styles.panelWrapper,
          { maxHeight: windowHeight - 120, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <ScrollView
          style={[styles.panel, { backgroundColor: rc('gray-2'), borderColor: rc('gray-6') }]}
          contentContainerStyle={styles.panelContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Heading size={5} style={{ color: rc('gray-12') }}>Theme</Heading>
            <Pressable
              onPress={toggle}
              accessibilityRole="button"
              accessibilityLabel="Close theme panel"
              style={[styles.closeButton, { borderColor: rc('gray-6') }]}
            >
              <Text size={2} weight="bold" style={{ color: rc('gray-12') }}>T</Text>
            </Pressable>
          </View>

          {/* ─── Accent color ─────────────────────────────────────── */}
          <SectionLabel rc={rc}>Accent color</SectionLabel>
          <View style={styles.dotGrid}>
            {ACCENT_COLORS.map((c) => (
              <ColorDot
                key={c}
                color={`${c}-9`}
                selected={accentColor === c}
                onPress={() => onAccentColorChange(c)}
                rc={rc}
                label={c}
              />
            ))}
          </View>

          {/* ─── Gray color ───────────────────────────────────────── */}
          <SectionLabel rc={rc}>Gray color</SectionLabel>
          <View style={styles.dotGrid}>
            {GRAY_OPTIONS.map((g) => {
              const dotColor = g === 'auto'
                ? `${resolvedGrayColor}-9`
                : `${g}-9`
              return (
                <ColorDot
                  key={g}
                  color={dotColor}
                  selected={grayColor === g}
                  onPress={() => onGrayColorChange(g)}
                  rc={rc}
                  label={g}
                />
              )
            })}
          </View>

          {/* ─── Appearance ───────────────────────────────────────── */}
          <SectionLabel rc={rc}>Appearance</SectionLabel>
          <View style={styles.segmentedRow}>
            <SegmentedButton
              label="Light"
              icon={'\u2600\uFE0E'}
              selected={appearance === 'light'}
              onPress={() => onAppearanceChange('light')}
              rc={rc}
            />
            <SegmentedButton
              label="Dark"
              icon={'\u263E'}
              selected={appearance === 'dark'}
              onPress={() => onAppearanceChange('dark')}
              rc={rc}
            />
          </View>

          {/* ─── Radius ───────────────────────────────────────────── */}
          <SectionLabel rc={rc}>Radius</SectionLabel>
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((r) => (
              <RadiusPreview
                key={r}
                token={r}
                selected={radius === r}
                onPress={() => onRadiusChange(r)}
                rc={rc}
              />
            ))}
          </View>

          {/* ─── Scaling ──────────────────────────────────────────── */}
          <SectionLabel rc={rc}>Scaling</SectionLabel>
          <View style={styles.chipRow}>
            {SCALING_OPTIONS.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={scaling === s}
                onPress={() => onScalingChange(s)}
                rc={rc}
              />
            ))}
          </View>

          {/* ─── Copy Theme ───────────────────────────────────────── */}
          {showCopyTheme && (
            <Pressable
              style={[styles.copyButton, { backgroundColor: rc('accent-9') }]}
              onPress={handleCopyTheme}
            >
              <Text size={2} weight="bold" style={{ color: rc('accent-contrast') }}>
                Copy Theme
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  )
}
ThemeControls.displayName = 'ThemeControls'

// ─── Internal components ──────────────────────────────────────────────────────

type RC = (color: ThemeColor) => string

function SectionLabel({ children, rc }: { children: string; rc: RC }) {
  return (
    <Text size={2} weight="medium" style={{ color: rc('accent-11'), marginTop: 4 }}>
      {children}
    </Text>
  )
}

function ColorDot({
  color, selected, onPress, rc, label,
}: { color: ThemeColor; selected: boolean; onPress: () => void; rc: RC; label: string }) {
  const bg = rc(color)
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={[
        styles.dotOuter,
        selected && { borderColor: rc('gray-12') },
      ]}
    >
      <View style={[styles.dotInner, { backgroundColor: bg }]} />
    </Pressable>
  )
}

function SegmentedButton({
  label, icon, selected, onPress, rc,
}: { label: string; icon: string; selected: boolean; onPress: () => void; rc: RC }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.segmentedButton,
        {
          borderColor: selected ? rc('gray-12') : rc('gray-6'),
          backgroundColor: selected ? rc('gray-3') : 'transparent',
        },
      ]}
    >
      <Text size={2} style={{ color: rc('gray-12') }}>{icon}</Text>
      <Text size={2} weight="medium" style={{ color: rc('gray-12') }}>{label}</Text>
    </Pressable>
  )
}

function RadiusPreview({
  token, selected, onPress, rc,
}: { token: RadiusToken; selected: boolean; onPress: () => void; rc: RC }) {
  const previewRadius = token === 'full'
    ? 26
    : getRadius(token, 5)

  const label = token.charAt(0).toUpperCase() + token.slice(1)
  const borderAccent = rc('accent-a8')

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.radiusItem}>
      <View
        style={[
          styles.radiusCard,
          {
            borderColor: selected ? rc('gray-12') : rc('gray-6'),
            backgroundColor: selected ? rc('gray-3') : 'transparent',
          },
        ]}
      >
        <View
          style={[
            styles.radiusPreviewShape,
            {
              backgroundColor: rc('accent-4'),
              borderTopLeftRadius: previewRadius,
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderTopColor: borderAccent,
              borderLeftColor: borderAccent,
            },
          ]}
        />
      </View>
      <Text size={1} style={{ color: rc('gray-11'), textAlign: 'center' }}>{label}</Text>
    </Pressable>
  )
}

function Chip({
  label, selected, onPress, rc,
}: { label: string; selected: boolean; onPress: () => void; rc: RC }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.chip,
        {
          borderColor: selected ? rc('gray-12') : rc('gray-6'),
          backgroundColor: selected ? rc('gray-3') : 'transparent',
        },
      ]}
    >
      <Text
        size={2}
        weight={selected ? 'bold' : 'regular'}
        style={{ color: rc('gray-12') }}
      >
        {label}
      </Text>
    </Pressable>
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
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 20,
    rowGap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dotOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 6,
  },
  radiusItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  radiusCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusPreviewShape: {
    width: 32,
    height: 32,
  },
  copyButton: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
