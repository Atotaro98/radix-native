import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, Text as RNText, View } from 'react-native'
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { useMetrics } from '../../hooks/useMetrics'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useVariantColors } from '../../hooks/useVariantColors'
import { shadowStyle } from '../../utils/shadow'
import { AnchoredContent, type AnchoredPlacementProps, type Measurable } from './AnchoredContent'
import { CardRing } from './CardRing'
import type { Rect } from '../../utils/popper'
import type { AccentColor } from '../../tokens/colors/types'
import type { MenuVariant } from '../../utils/variantPalette'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MenuSize = 1 | 2
export type { MenuVariant }

/** The event `onSelect` gets: `preventDefault()` keeps the menu open. */
export interface MenuSelectEvent {
  preventDefault: () => void
  readonly defaultPrevented: boolean
}

export interface MenuContentProps extends AnchoredPlacementProps {
  /** Default: 2. */
  size?: MenuSize
  /** Default: 'solid'. */
  variant?: MenuVariant
  color?: AccentColor
  highContrast?: boolean
  style?: StyleProp<ViewStyle>
  testID?: string
  children?: React.ReactNode
}

export interface MenuItemProps {
  /** Accent color of this item. */
  color?: AccentColor
  /** Trailing text, e.g. `⌘ E`. */
  shortcut?: string
  disabled?: boolean
  /** Called on press; the whole menu closes unless it calls `event.preventDefault()`. */
  onSelect?: (event: MenuSelectEvent) => void
  /** Radix typeahead text; accepted for API parity. */
  textValue?: string
  testID?: string
  children?: React.ReactNode
}

export interface MenuCheckboxItemProps extends MenuItemProps {
  checked?: boolean | 'indeterminate'
  onCheckedChange?: (checked: boolean) => void
}

export interface MenuRadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}

export interface MenuRadioItemProps extends Omit<MenuItemProps, 'shortcut'> {
  value: string
}

export interface MenuSubProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

// ─── Size mappings (base-menu.css) ────────────────────────────────────────────

const SIZES: Record<MenuSize, {
  padding: number; radius: 3 | 4; itemHeight: number; itemRadius: 1 | 2
  padX: number; padLeftIndicator: number; fontSize: 1 | 2; icon: number
}> = {
  // content padding space-1 / space-2; item height space-5 / space-6; gutter calc(space-5 / 1.2) / space-5
  1: { padding: 4, radius: 3, itemHeight: 24, itemRadius: 1, padX: 8, padLeftIndicator: 20, fontSize: 1, icon: 8 },
  2: { padding: 8, radius: 4, itemHeight: 32, itemRadius: 2, padX: 12, padLeftIndicator: 24, fontSize: 2, icon: 10 },
}

// ─── Contexts ─────────────────────────────────────────────────────────────────

interface MenuRootValue {
  open: boolean
  setOpen: (open: boolean) => void
  anchor: React.MutableRefObject<Measurable | Rect | null>
}

interface MenuContentValue {
  size: MenuSize
  variant: MenuVariant
  color?: AccentColor
  highContrast?: boolean
  /** Some item in this content shows an indicator: every row reserves the wide left gutter. */
  gutter: boolean
  /** Closes the whole menu (root and subs). */
  closeAll: () => void
}

export const MenuRootContext = createContext<MenuRootValue | null>(null)
const MenuContentContext = createContext<MenuContentValue | null>(null)
const RadioGroupContext = createContext<{ value?: string; onValueChange?: (v: string) => void } | null>(null)
const SubContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  anchor: React.MutableRefObject<Measurable | null>
} | null>(null)

function useContent(part: string): MenuContentValue {
  const ctx = useContext(MenuContentContext)
  if (!ctx) throw new Error(`${part} must be used within a menu Content`)
  return ctx
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function useMenuRoot({ open: openProp, defaultOpen = false, onOpenChange }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (o: boolean) => void }) {
  const [open, setOpen] = useControllableState<boolean>({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange })
  const anchor = useRef<Measurable | Rect | null>(null)
  return useMemo<MenuRootValue>(() => ({ open, setOpen: (o: boolean) => setOpen(o), anchor }), [open, setOpen])
}

// ─── Content ──────────────────────────────────────────────────────────────────

/** Radix decides the gutter with CSS `:has`: scan this content's own children (not sub-menus). */
function hasIndicatorItems(children: React.ReactNode): boolean {
  let found = false
  React.Children.forEach(children, (child) => {
    if (found || !React.isValidElement<{ children?: React.ReactNode }>(child)) return
    if (child.type === MenuCheckboxItem || child.type === MenuRadioItem) found = true
    else if (child.type !== MenuSubContent) found = hasIndicatorItems(child.props.children)
  })
  return found
}

function MenuPanel({ size, children, availableHeight, style }: { size: MenuSize; children: React.ReactNode; availableHeight?: number; style?: StyleProp<ViewStyle> }) {
  const metrics = useMetrics()
  const colors = useVariantColors('popperPanel', {})
  const cfg = SIZES[size]
  const borderRadius = metrics.radius(cfg.radius)
  return (
    <View
      accessibilityRole="menu"
      style={[{ maxHeight: availableHeight, borderRadius, backgroundColor: colors.panel }, shadowStyle(colors.shadow), style]}
    >
      {/* flexGrow 0: a ScrollView grows to its parent's max-height otherwise, inflating the measured size */}
      <ScrollView bounces={false} style={{ borderRadius, flexGrow: 0 }} contentContainerStyle={{ padding: metrics.px(cfg.padding) }}>
        {children}
      </ScrollView>
      <CardRing color={colors.ring} borderRadius={borderRadius} />
    </View>
  )
}

/**
 * Internal: a menu's content (DropdownMenu / ContextMenu). A modal Anchored
 * overlay: its backdrop swallows outside touches, as Radix menus are modal.
 */
export function MenuContent({
  size = 2, variant = 'solid', color, highContrast,
  side = 'bottom', sideOffset = 4, align = 'start', alignOffset = 0,
  avoidCollisions, collisionPadding = 10, sticky,
  style, testID, children,
}: MenuContentProps) {
  const root = useContext(MenuRootContext)
  if (!root) throw new Error('Menu Content must be used within its Root')
  const close = useCallback(() => root.setOpen(false), [root])
  const value = useMemo<MenuContentValue>(() => ({
    size, variant, color, highContrast, gutter: hasIndicatorItems(children), closeAll: close,
  }), [size, variant, color, highContrast, children, close])

  return (
    <AnchoredContent
      open={root.open}
      onDismiss={close}
      anchor={root.anchor}
      modal
      side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}
      avoidCollisions={avoidCollisions} collisionPadding={collisionPadding} sticky={sticky}
      testID={testID}
    >
      {(placement) => (
        <MenuPanel size={size} availableHeight={placement?.availableHeight} style={style}>
          {/* The portal host is elsewhere in the tree: re-provide the menu contexts */}
          <MenuRootContext.Provider value={root}>
            <MenuContentContext.Provider value={value}>{children}</MenuContentContext.Provider>
          </MenuRootContext.Provider>
        </MenuPanel>
      )}
    </AnchoredContent>
  )
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

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

/** A ThickChevronRightIcon stand-in. */
function Chevron({ size, color }: { size: number; color: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size * 0.55, height: size * 0.55, marginLeft: -size * 0.2,
        borderRightWidth: size * 0.18, borderTopWidth: size * 0.18, borderColor: color,
        transform: [{ rotate: '45deg' }],
      }} />
    </View>
  )
}

interface RowProps extends MenuItemProps {
  role: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio'
  checked?: boolean | 'indeterminate'
  subOpen?: boolean
  chevron?: boolean
  /** Runs before the close (checkbox toggle, radio change). */
  onActivate?: () => void
  /** SubTrigger: opens its sub instead of closing the menu. */
  keepOpen?: boolean
  onPressRow?: (e: GestureResponderEvent) => void
  /** The row's host instance (a SubTrigger anchors its sub to it). */
  rowRef?: (node: Measurable | null) => void
}

function MenuRow({
  role, checked, subOpen, chevron, color, shortcut, disabled, onSelect, onActivate, keepOpen, onPressRow, rowRef, testID, children,
}: RowProps) {
  const content = useContent('Menu item')
  const metrics = useMetrics()
  const cfg = SIZES[content.size]
  const [pressed, setPressed] = useState(false)
  const colors = useVariantColors('menuItem', {
    variant: content.variant,
    color: color ?? content.color,
    highContrast: content.highContrast,
    disabled,
    highlighted: pressed,
    subOpen,
  })
  const text = useTextStyle({ size: cfg.fontSize, color: colors.text, compact: true })
  const shortcutText = useTextStyle({ size: cfg.fontSize, color: colors.shortcut, compact: true })
  const icon = metrics.px(cfg.icon)
  const padLeft = metrics.px(content.gutter ? cfg.padLeftIndicator : cfg.padX)

  const onPress = useCallback((e: GestureResponderEvent) => {
    onPressRow?.(e)
    if (keepOpen) return
    let prevented = false
    const event: MenuSelectEvent = {
      preventDefault: () => { prevented = true },
      get defaultPrevented() { return prevented },
    }
    onSelect?.(event)
    onActivate?.()
    if (!prevented) content.closeAll()
  }, [onPressRow, keepOpen, onSelect, onActivate, content])

  return (
    <Pressable
      ref={rowRef as unknown as React.Ref<React.ComponentRef<typeof Pressable>>}
      testID={testID}
      accessibilityRole={role === 'menuitem' ? 'menuitem' : role === 'menuitemcheckbox' ? 'checkbox' : 'radio'}
      accessibilityState={{ disabled: !!disabled, checked: role === 'menuitem' ? undefined : checked === 'indeterminate' ? 'mixed' : !!checked, expanded: chevron ? !!subOpen : undefined }}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: metrics.space(2),
        height: metrics.px(cfg.itemHeight),
        paddingLeft: padLeft,
        paddingRight: metrics.px(cfg.padX),
        borderRadius: metrics.radius(cfg.itemRadius),
        backgroundColor: colors.bg,
      }}
    >
      {checked ? (
        // .rt-BaseMenuItemIndicator: centred in the left gutter
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: padLeft, alignItems: 'center', justifyContent: 'center' }}>
          <Check size={icon} color={colors.text} />
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: metrics.space(2), flexShrink: 1 }}>
        {React.Children.map(children, (child) =>
          typeof child === 'string' || typeof child === 'number'
            ? <RNText {...text.textProps} style={text.style}>{child}</RNText>
            : React.isValidElement<{ color?: string }>(child) && child.props.color === undefined
              ? React.cloneElement(child, { color: colors.text })
              : child,
        )}
      </View>
      {shortcut || chevron ? (
        // .rt-BaseMenuShortcut: margin-left auto, padding-left space-4
        <View style={{ marginLeft: 'auto', paddingLeft: metrics.space(4), flexDirection: 'row', alignItems: 'center' }}>
          {chevron
            ? <View style={{ marginRight: -2 * metrics.scaling }}><Chevron size={icon} color={colors.text} /></View>
            : <RNText {...shortcutText.textProps} style={shortcutText.style}>{shortcut}</RNText>}
        </View>
      ) : null}
    </Pressable>
  )
}

export function MenuItem(props: MenuItemProps) {
  return <MenuRow role="menuitem" {...props} />
}
MenuItem.displayName = 'Menu.Item'

export function MenuCheckboxItem({ checked = false, onCheckedChange, ...props }: MenuCheckboxItemProps) {
  // onSelect → onCheckedChange(indeterminate ? true : !checked)
  return (
    <MenuRow
      role="menuitemcheckbox"
      checked={checked}
      onActivate={() => onCheckedChange?.(checked === 'indeterminate' ? true : !checked)}
      {...props}
    />
  )
}
MenuCheckboxItem.displayName = 'Menu.CheckboxItem'

export function MenuRadioGroup({ value, onValueChange, children }: MenuRadioGroupProps) {
  const ctx = useMemo(() => ({ value, onValueChange }), [value, onValueChange])
  return (
    <View accessibilityRole="radiogroup">
      <RadioGroupContext.Provider value={ctx}>{children}</RadioGroupContext.Provider>
    </View>
  )
}
MenuRadioGroup.displayName = 'Menu.RadioGroup'

export function MenuRadioItem({ value, ...props }: MenuRadioItemProps) {
  const group = useContext(RadioGroupContext)
  return (
    <MenuRow
      role="menuitemradio"
      checked={group?.value === value}
      onActivate={() => group?.onValueChange?.(value)}
      {...props}
    />
  )
}
MenuRadioItem.displayName = 'Menu.RadioItem'

export function MenuLabel({ children }: { children?: React.ReactNode }) {
  const content = useContent('Menu.Label')
  const metrics = useMetrics()
  const chrome = useVariantColors('menuChrome', {})
  const cfg = SIZES[content.size]
  const text = useTextStyle({ size: cfg.fontSize, color: chrome.label, compact: true })
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', height: metrics.px(cfg.itemHeight),
      paddingLeft: metrics.px(content.gutter ? cfg.padLeftIndicator : cfg.padX), paddingRight: metrics.px(cfg.padX),
    }}>
      {typeof children === 'string' ? <RNText {...text.textProps} style={text.style}>{children}</RNText> : children}
    </View>
  )
}
MenuLabel.displayName = 'Menu.Label'

export function MenuGroup({ children }: { children?: React.ReactNode }) {
  return <View accessibilityRole="none">{children}</View>
}
MenuGroup.displayName = 'Menu.Group'

export function MenuSeparator() {
  const content = useContent('Menu.Separator')
  const metrics = useMetrics()
  const chrome = useVariantColors('menuChrome', {})
  const cfg = SIZES[content.size]
  return (
    <View style={{
      height: 1, backgroundColor: chrome.separator, marginVertical: metrics.space(2),
      marginLeft: metrics.px(content.gutter ? cfg.padLeftIndicator : cfg.padX), marginRight: metrics.px(cfg.padX),
    }} />
  )
}
MenuSeparator.displayName = 'Menu.Separator'

// ─── Sub-menus ────────────────────────────────────────────────────────────────

export function MenuSub({ open: openProp, defaultOpen = false, onOpenChange, children }: MenuSubProps) {
  const [open, setOpen] = useControllableState<boolean>({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange })
  const anchor = useRef<Measurable | null>(null)
  const ctx = useMemo(() => ({ open, setOpen: (o: boolean) => setOpen(o), anchor }), [open, setOpen])
  return <SubContext.Provider value={ctx}>{children}</SubContext.Provider>
}
MenuSub.displayName = 'Menu.Sub'

/** Opens its sub on press (Radix also on hover); the parent menu stays open. */
export function MenuSubTrigger({ disabled, testID, children }: { disabled?: boolean; testID?: string; children?: React.ReactNode }) {
  const sub = useContext(SubContext)
  if (!sub) throw new Error('Menu.SubTrigger must be used within Menu.Sub')
  return (
    <MenuRow
      role="menuitem"
      chevron
      subOpen={sub.open}
      disabled={disabled}
      keepOpen
      testID={testID}
      rowRef={(node) => { if (node) sub.anchor.current = node }}
      onPressRow={() => sub.setOpen(!sub.open)}
    >
      {children}
    </MenuRow>
  )
}
MenuSubTrigger.displayName = 'Menu.SubTrigger'

/**
 * A sub-menu: another Anchored overlay to the right of its SubTrigger (1px
 * away, aligned so the first item lines up with the trigger), flipping left
 * when there is no room. Not modal: touching the parent menu closes it first.
 * Inherits size, variant, color and high contrast from the parent content.
 */
export function MenuSubContent({
  size, variant, color, highContrast, sideOffset = 1, align = 'start', alignOffset, avoidCollisions, collisionPadding = 10, sticky, style, testID, children,
}: Omit<MenuContentProps, 'side'>) {
  const sub = useContext(SubContext)
  const parent = useContent('Menu.SubContent')
  const root = useContext(MenuRootContext)
  if (!sub) throw new Error('Menu.SubContent must be used within Menu.Sub')
  const resolvedSize = size ?? parent.size
  const close = useCallback(() => sub.setOpen(false), [sub])
  const value = useMemo<MenuContentValue>(() => ({
    size: resolvedSize,
    variant: variant ?? parent.variant,
    color: color ?? parent.color,
    highContrast: highContrast ?? parent.highContrast,
    gutter: hasIndicatorItems(children),
    closeAll: parent.closeAll,
  }), [resolvedSize, variant, color, highContrast, parent, children])

  return (
    <AnchoredContent
      open={sub.open && (root?.open ?? true)}
      onDismiss={close}
      anchor={sub.anchor}
      side="right" sideOffset={sideOffset} align={align}
      alignOffset={alignOffset ?? -SIZES[resolvedSize].padding}
      avoidCollisions={avoidCollisions} collisionPadding={collisionPadding} sticky={sticky}
      testID={testID}
    >
      {(placement) => (
        <MenuPanel size={resolvedSize} availableHeight={placement?.availableHeight} style={style}>
          <MenuRootContext.Provider value={root}>
            <SubContext.Provider value={sub}>
              <MenuContentContext.Provider value={value}>{children}</MenuContentContext.Provider>
            </SubContext.Provider>
          </MenuRootContext.Provider>
        </MenuPanel>
      )}
    </AnchoredContent>
  )
}
MenuSubContent.displayName = 'Menu.SubContent'
