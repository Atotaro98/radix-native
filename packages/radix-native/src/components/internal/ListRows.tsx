import React, { useMemo } from 'react'
import { Pressable, Text as RNText, View } from 'react-native'
import type { AccessibilityRole, AccessibilityState, GestureResponderEvent } from 'react-native'
import { useInteraction } from '../../hooks/useInteraction'
import { useMetrics } from '../../hooks/useMetrics'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useAccessibleControl } from './accessibleControl'
import { ControlLabel } from './ControlLabel'
import type { AccentColor } from '../../tokens/colors/types'
import type { MenuVariant } from '../../utils/variantPalette'

/**
 * Internal: the rows of a menu's content (DropdownMenu, ContextMenu, their
 * sub-menus) and of a Select's list — Radix draws both from base-menu.css,
 * Select sizes 1 and 2 matching the menu's, size 3 only with larger item text.
 * Each kind of row knows its own height (`rowHeight`), so Select's item-aligned
 * position adds up the same numbers the rows render with.
 */

export type ListSize = 1 | 2 | 3

// base-menu.css / select.css: content padding space-1 / space-2; item height space-5 / space-6;
// item padding-x space-2 / space-3; indicator gutter calc(space-5 / 1.2) / space-5
const SIZES: Record<ListSize, {
  padding: number; radius: 3 | 4; itemHeight: number; itemRadius: 1 | 2
  padX: number; gutter: number; icon: number; font: 1 | 2 | 3; labelFont: 1 | 2
}> = {
  1: { padding: 4, radius: 3, itemHeight: 24, itemRadius: 1, padX: 8, gutter: 20, icon: 8, font: 1, labelFont: 1 },
  2: { padding: 8, radius: 4, itemHeight: 32, itemRadius: 2, padX: 12, gutter: 24, icon: 10, font: 2, labelFont: 2 },
  3: { padding: 8, radius: 4, itemHeight: 32, itemRadius: 2, padX: 12, gutter: 24, icon: 10, font: 3, labelFont: 2 },
}

/** A list's resolved lengths in px. */
export interface ListMetrics {
  /** Content padding (all sides) and radius. */
  padding: number
  borderRadius: number
  itemHeight: number
  itemRadius: number
  /** Item padding-x without an indicator. */
  padX: number
  /** The left gutter an indicator sits in. */
  gutter: number
  icon: number
  /** A separator's vertical margin. */
  separatorMargin: number
  font: 1 | 2 | 3
  labelFont: 1 | 2
}

export function useListMetrics(size: ListSize): ListMetrics {
  const metrics = useMetrics()
  return useMemo(() => {
    const cfg = SIZES[size]
    return {
    padding: metrics.px(cfg.padding),
    borderRadius: metrics.radius(cfg.radius),
    itemHeight: metrics.px(cfg.itemHeight),
    itemRadius: metrics.radius(cfg.itemRadius),
    padX: metrics.px(cfg.padX),
    gutter: metrics.px(cfg.gutter),
    icon: metrics.px(cfg.icon),
    separatorMargin: metrics.space(2),
    font: cfg.font,
    labelFont: cfg.labelFont,
  }
  }, [metrics, size])
}

/** The height each kind of row renders with: items and labels are one item tall; a separator is 1px plus its margins. */
export function rowHeight(list: ListMetrics, kind: 'item' | 'label' | 'separator'): number {
  return kind === 'separator' ? 1 + 2 * list.separatorMargin : list.itemHeight
}

/** A ThickCheckIcon stand-in: a rotated L drawn with borders. */
function Check({ size, color }: { size: number; color: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size * 0.45, height: size * 0.8, marginTop: -size * 0.15,
        borderRightWidth: size * 0.2, borderBottomWidth: size * 0.2, borderColor: color,
        transform: [{ rotate: '45deg' }],
      }} />
    </View>
  )
}

/** The item colors a list's content passes down to its rows. */
export interface ListLook {
  variant: MenuVariant
  color?: AccentColor
  highContrast?: boolean
}

export interface ListRowProps {
  list: ListMetrics
  look: ListLook
  /** The item's own accent color. */
  color?: AccentColor
  paddingLeft: number
  paddingRight: number
  accessibilityRole: AccessibilityRole
  accessibilityState?: AccessibilityState
  disabled?: boolean
  /** Shows the check in the left gutter. */
  checked?: boolean
  /** A SubTrigger whose sub-menu is open keeps a highlight. */
  subOpen?: boolean
  onPress: (e: GestureResponderEvent) => void
  /** The row's host instance (a SubTrigger anchors its sub-menu to it). */
  rowRef?: (node: unknown) => void
  /** Right-aligned content (a shortcut, a chevron), given the row's text color. */
  trailing?: (colors: { text: string; shortcut: string }) => React.ReactNode
  testID?: string
  children?: React.ReactNode
}

/**
 * Internal: one pressable row — `.rt-BaseMenuItem` / `.rt-SelectItem`. Its
 * colors come from the `menuItem` recipe (highlighted while pressed), its
 * content is a Control label, a checked row shows the check centred in the
 * left gutter, and the content names the row for screen readers.
 */
export function ListRow({
  list, look, color, paddingLeft, paddingRight, accessibilityRole, accessibilityState, disabled, checked, subOpen,
  onPress, rowRef, trailing, testID, children,
}: ListRowProps) {
  const metrics = useMetrics()
  const { pressed, handlers } = useInteraction({ enabled: !disabled })
  const colors = useVariantColors('menuItem', {
    variant: look.variant,
    color: color ?? look.color,
    highContrast: look.highContrast,
    disabled,
    highlighted: pressed,
    subOpen,
  })
  const a11y = useAccessibleControl(children, undefined)

  return (
    <Pressable
      ref={rowRef as React.Ref<React.ComponentRef<typeof Pressable>> | undefined}
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={a11y.accessibilityLabel}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      disabled={disabled}
      onPressIn={handlers.onPressIn}
      onPressOut={handlers.onPressOut}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        // .rt-BaseMenuItem gap: space-2 (between the label and a shortcut / chevron)
        gap: metrics.space(2),
        height: list.itemHeight,
        paddingLeft,
        paddingRight,
        borderRadius: list.itemRadius,
        backgroundColor: colors.bg,
      }}
    >
      {checked ? (
        // .rt-BaseMenuItemIndicator: centred in the left gutter
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: paddingLeft, alignItems: 'center', justifyContent: 'center' }}>
          <Check size={list.icon} color={colors.text} />
        </View>
      ) : null}
      {a11y.wrap(
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: metrics.space(2), flexShrink: 1 }}>
          <ControlLabel size={list.font} weight="regular" color={colors.text}>{children}</ControlLabel>
        </View>,
      )}
      {trailing ? (
        // .rt-BaseMenuShortcut: margin-left auto, padding-left space-4
        <View style={{ marginLeft: 'auto', paddingLeft: metrics.space(4), flexDirection: 'row', alignItems: 'center' }}>
          {trailing({ text: colors.text, shortcut: colors.shortcut })}
        </View>
      ) : null}
    </Pressable>
  )
}

/** A row's trailing text (a menu item's shortcut). */
export function ListShortcut({ list, color, children }: { list: ListMetrics; color: string; children: string }) {
  const text = useTextStyle({ size: list.font, color, compact: true })
  return <RNText {...text.textProps} style={text.style}>{children}</RNText>
}

/** `.rt-BaseMenuLabel` / `.rt-SelectLabel`: a group's heading, one item tall, gray-a10. */
export function ListLabel({ list, paddingLeft, paddingRight, children }: {
  list: ListMetrics; paddingLeft: number; paddingRight: number; children?: React.ReactNode
}) {
  const chrome = useVariantColors('menuChrome', {})
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: rowHeight(list, 'label'), paddingLeft, paddingRight }}>
      <ControlLabel size={list.labelFont} weight="regular" color={chrome.label}>{children}</ControlLabel>
    </View>
  )
}

/** `.rt-BaseMenuSeparator` / `.rt-SelectSeparator`: a 1px rule with space-2 above and below. */
export function ListSeparator({ list, marginLeft, marginRight }: { list: ListMetrics; marginLeft: number; marginRight: number }) {
  const chrome = useVariantColors('menuChrome', {})
  return (
    <View style={{ height: 1, backgroundColor: chrome.separator, marginVertical: list.separatorMargin, marginLeft, marginRight }} />
  )
}
