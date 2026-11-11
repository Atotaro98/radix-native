import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, Text as RNText, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { useInteraction } from '../../hooks/useInteraction'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useVariantColors } from '../../hooks/useVariantColors'
import { shadowStyle } from '../../utils/shadow'
import { placeItemAligned } from '../../utils/selectLayout'
import { AnchoredContent, type AnchoredPlacementProps, type Measurable } from '../internal/AnchoredContent'
import { CardRing } from '../internal/CardRing'
import { FocusRing } from '../internal/FocusRing'
import type { AccentColor } from '../../tokens/colors/types'
import type { RadiusToken } from '../../theme/theme.types'
import type { MarginProps } from '../../types/marginProps'
import type { MenuVariant, SelectTriggerVariant } from '../../utils/variantPalette'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectSize = 1 | 2 | 3
export type { SelectTriggerVariant }
export type SelectContentVariant = MenuVariant

export interface SelectRootProps {
  /** Default: 2. Sizes both the trigger and the content. */
  size?: SelectSize
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  children?: React.ReactNode
}

export interface SelectTriggerProps extends MarginProps {
  /** Default: 'surface'. */
  variant?: SelectTriggerVariant
  color?: AccentColor
  radius?: RadiusToken
  /** Shown when there is no value. */
  placeholder?: React.ReactNode
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
  /** Replaces the selected item's text in the trigger. */
  children?: React.ReactNode
}

export interface SelectContentProps extends AnchoredPlacementProps {
  /** Default: 'solid'. */
  variant?: SelectContentVariant
  color?: AccentColor
  highContrast?: boolean
  /** Default: 'item-aligned' (Radix): the selected item over the trigger. 'popper' places it below. */
  position?: 'item-aligned' | 'popper'
  style?: StyleProp<ViewStyle>
  testID?: string
  children?: React.ReactNode
}

export interface SelectItemProps {
  /** Required; `''` is reserved for "no value" (the placeholder). */
  value: string
  disabled?: boolean
  /** The text shown in the trigger when selected (default: the item's text). */
  textValue?: string
  testID?: string
  children?: React.ReactNode
}

// ─── Size mappings (select.css) ───────────────────────────────────────────────

const TRIGGER: Record<SelectSize, { height: number; padX: number; ghostPadY: number; ghostPadX: number; gap: number; font: 1 | 2 | 3; radius: 1 | 2 | 3; icon: number }> = {
  1: { height: 24, padX: 8, ghostPadY: 4, ghostPadX: 8, gap: 4, font: 1, radius: 1, icon: 9 },
  2: { height: 32, padX: 12, ghostPadY: 4, ghostPadX: 8, gap: 6, font: 2, radius: 2, icon: 9 },
  3: { height: 40, padX: 16, ghostPadY: 6, ghostPadX: 12, gap: 8, font: 3, radius: 3, icon: 11 },
}

const CONTENT: Record<SelectSize, { padding: number; radius: 3 | 4; itemHeight: number; gutter: number; itemFont: 1 | 2 | 3; labelFont: 1 | 2; itemRadius: 1 | 2; check: number }> = {
  1: { padding: 4, radius: 3, itemHeight: 24, gutter: 20, itemFont: 1, labelFont: 1, itemRadius: 1, check: 8 },
  2: { padding: 8, radius: 4, itemHeight: 32, gutter: 24, itemFont: 2, labelFont: 2, itemRadius: 2, check: 10 },
  3: { padding: 8, radius: 4, itemHeight: 32, gutter: 24, itemFont: 3, labelFont: 2, itemRadius: 2, check: 10 },
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SelectContextValue {
  size: SelectSize
  value: string | undefined
  setValue: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
  disabled: boolean
  anchor: React.MutableRefObject<Measurable | null>
  /** The content's rows in order, known before it ever opens (see ItemRegistry). */
  entries: Entry[]
  register: (key: object, entry: Entry) => () => void
  triggerPadX: React.MutableRefObject<number>
}

type Entry = { kind: 'item'; value: string; label: React.ReactNode } | { kind: 'label' } | { kind: 'separator' }

/** True while Content renders its children only to register them (RN can't mirror item text like Radix). */
const RegistryContext = createContext(false)

function useRegister(entry: Entry) {
  const ctx = useContext(SelectContext)
  const registering = useContext(RegistryContext)
  const key = useRef({}).current
  const label = entry.kind === 'item' ? entry.label : undefined
  const value = entry.kind === 'item' ? entry.value : undefined
  useLayoutEffect(() => {
    if (!registering || !ctx) return
    return ctx.register(key, entry)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registering, ctx?.register, key, entry.kind, value, label])
  return registering
}

const SelectContext = createContext<SelectContextValue | null>(null)
const ContentContext = createContext<{ variant: MenuVariant; color?: AccentColor; highContrast?: boolean } | null>(null)

function useSelect(part: string): SelectContextValue {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error(`Select.${part} must be used within Select.Root`)
  return ctx
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function SelectRoot({
  size = 2, value: valueProp, defaultValue, onValueChange, open: openProp, defaultOpen = false, onOpenChange, disabled = false, children,
}: SelectRootProps) {
  const [value, setValue] = useControllableState<string | undefined>({ prop: valueProp, defaultProp: defaultValue, onChange: onValueChange as (v: string | undefined) => void })
  const [open, setOpen] = useControllableState<boolean>({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange })
  const anchor = useRef<Measurable | null>(null)
  const triggerPadX = useRef(0)
  // Rows register in tree order (layout effects run in order), like Radix's collection
  const registry = useRef(new Map<object, Entry>())
  const [entries, setEntries] = useState<Entry[]>([])
  const register = useCallback((key: object, entry: Entry) => {
    registry.current.set(key, entry)
    setEntries(Array.from(registry.current.values()))
    return () => {
      registry.current.delete(key)
      setEntries(Array.from(registry.current.values()))
    }
  }, [])
  const ctx = useMemo<SelectContextValue>(() => ({
    size, value, setValue: (v: string) => setValue(v), open, setOpen: (o: boolean) => setOpen(o), disabled, anchor, entries, register, triggerPadX,
  }), [size, value, setValue, open, setOpen, disabled, entries, register])
  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>
}
SelectRoot.displayName = 'Select.Root'

// ─── Trigger ──────────────────────────────────────────────────────────────────

/** A ChevronDownIcon stand-in. */
function Chevron({ size, color }: { size: number; color: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size * 0.55, height: size * 0.55, marginTop: -size * 0.25,
        borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: color, transform: [{ rotate: '45deg' }],
      }} />
    </View>
  )
}

function SelectTrigger({
  variant = 'surface', color, radius, placeholder, m, mx, my, mt, mr, mb, ml, style, testID, accessibilityLabel, children,
}: SelectTriggerProps) {
  const ctx = useSelect('Trigger')
  const metrics = useMetrics({ radius })
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const cfg = TRIGGER[ctx.size]
  const colors = useVariantColors('selectTrigger', { variant, color, disabled: ctx.disabled, open: ctx.open })
  const focus = useVariantColors('focusRing', { color })
  const { focused, handlers } = useInteraction({ enabled: false })
  const showPlaceholder = ctx.value === undefined || ctx.value === ''
  const text = useTextStyle({ size: cfg.font, color: showPlaceholder ? colors.placeholder : colors.text, compact: true, truncate: true })
  const ghost = variant === 'ghost'
  const borderRadius = metrics.radius(cfg.radius, 'pill')
  const padX = metrics.px(ghost ? cfg.ghostPadX : cfg.padX)
  ctx.triggerPadX.current = padX

  const selectedEntry = ctx.entries.find((e) => e.kind === 'item' && e.value === ctx.value)
  const label = children ?? (showPlaceholder ? placeholder : selectedEntry?.kind === 'item' ? selectedEntry.label : undefined)
  const labelText = typeof label === 'string' ? label : undefined
  const content = typeof label === 'string' || typeof label === 'number'
    ? <RNText {...text.textProps} style={[text.style, { flexShrink: 1 }]}>{label}</RNText>
    : label

  const triggerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'flex-start',
    gap: metrics.px(cfg.gap),
    paddingHorizontal: padX,
    borderRadius,
    backgroundColor: colors.bg,
    ...(ghost
      // ghost: fit-content height, padding offset by an equal negative margin
      ? { paddingVertical: metrics.px(cfg.ghostPadY), marginVertical: -metrics.px(cfg.ghostPadY), marginHorizontal: -padX }
      : { height: metrics.px(cfg.height) }),
    ...margins,
  }

  return (
    <Pressable
      ref={(node) => { if (node) ctx.anchor.current = node as unknown as Measurable }}
      testID={testID}
      accessibilityRole="combobox"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={labelText ? { text: labelText } : undefined}
      accessibilityState={{ expanded: ctx.open, disabled: ctx.disabled }}
      disabled={ctx.disabled}
      {...handlers}
      onPress={() => ctx.setOpen(!ctx.open)}
      style={[triggerStyle, style]}
    >
      {content}
      <Chevron size={metrics.px(cfg.icon)} color={colors.icon} />
      {colors.border ? <CardRing color={colors.border} borderRadius={borderRadius} /> : null}
      <FocusRing visible={focused} color={focus.ring} borderRadius={borderRadius} />
    </Pressable>
  )
}
SelectTrigger.displayName = 'Select.Trigger'

// ─── Content ──────────────────────────────────────────────────────────────────

function SelectContent({
  variant = 'solid', color, highContrast, position = 'item-aligned',
  side = 'bottom', sideOffset = 4, align = 'start', alignOffset, avoidCollisions, collisionPadding = 10, sticky,
  style, testID, children,
}: SelectContentProps) {
  const ctx = useSelect('Content')
  const metrics = useMetrics()
  const panel = useVariantColors('popperPanel', {})
  const cfg = CONTENT[ctx.size]
  const borderRadius = metrics.radius(cfg.radius)
  const close = useCallback(() => ctx.setOpen(false), [ctx])
  const content = useMemo(() => ({ variant, color, highContrast }), [variant, color, highContrast])

  const itemHeight = metrics.px(cfg.itemHeight)
  const separatorHeight = 1 + 2 * metrics.space(2)
  // The selected item (else the first) and the px of rows above it
  const items = ctx.entries.filter((e): e is Extract<Entry, { kind: 'item' }> => e.kind === 'item')
  const target = items.find((e) => e.value === ctx.value) ?? items[0]
  let selectedIndex = 0
  let offsetBefore = 0
  for (const e of ctx.entries) {
    if (e === target) break
    if (e.kind === 'item') selectedIndex++
    else if (e.kind === 'label') offsetBefore += itemHeight
    else offsetBefore += separatorHeight
  }
  const placeOverride = useMemo(() => position === 'item-aligned'
    ? (anchor: { x: number; y: number; width: number; height: number }, size: { width: number; height: number }, boundary: { x: number; y: number; width: number; height: number }) =>
      placeItemAligned({
        trigger: anchor,
        triggerPaddingX: ctx.triggerPadX.current,
        content: size,
        boundary,
        contentPadding: metrics.px(cfg.padding),
        itemPaddingLeft: metrics.px(cfg.gutter),
        itemHeight,
        selectedIndex,
        offsetBefore,
      })
    : undefined, [position, ctx.triggerPadX, metrics, cfg, itemHeight, selectedIndex, offsetBefore])

  return (
    <>
    {/* Always mounted, renders nothing: lets the trigger show the selected text before the list opens */}
    <RegistryContext.Provider value>{children}</RegistryContext.Provider>
    <AnchoredContent
      open={ctx.open}
      onDismiss={close}
      anchor={ctx.anchor}
      modal
      matchAnchorWidth
      placeOverride={placeOverride}
      side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}
      avoidCollisions={avoidCollisions} collisionPadding={collisionPadding} sticky={sticky}
      testID={testID}
    >
      {(placement) => (
        <View
          accessibilityRole="list"
          style={[{ maxHeight: placement?.availableHeight, borderRadius, backgroundColor: panel.panel }, shadowStyle(panel.shadow), style]}
        >
          <ScrollView bounces={false} style={{ borderRadius, flexGrow: 0 }} contentContainerStyle={{ padding: metrics.px(cfg.padding) }}>
            <SelectContext.Provider value={ctx}>
              <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
            </SelectContext.Provider>
          </ScrollView>
          <CardRing color={panel.ring} borderRadius={borderRadius} />
        </View>
      )}
    </AnchoredContent>
    </>
  )
}
SelectContent.displayName = 'Select.Content'

// ─── Items ────────────────────────────────────────────────────────────────────

function Check({ size, color }: { size: number; color: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size * 0.45, height: size * 0.8, marginTop: -size * 0.15,
        borderRightWidth: size * 0.2, borderBottomWidth: size * 0.2, borderColor: color, transform: [{ rotate: '45deg' }],
      }} />
    </View>
  )
}

function SelectItem(props: SelectItemProps) {
  const registering = useRegister({ kind: 'item', value: props.value, label: props.textValue ?? props.children })
  return registering ? null : <SelectItemRow {...props} />
}
SelectItem.displayName = 'Select.Item'

function SelectItemRow({ value, disabled, testID, children }: SelectItemProps) {
  const ctx = useSelect('Item')
  const look = useContext(ContentContext)
  const metrics = useMetrics()
  const cfg = CONTENT[ctx.size]
  const [pressed, setPressed] = useState(false)
  const colors = useVariantColors('menuItem', {
    variant: look?.variant ?? 'solid', color: look?.color, highContrast: look?.highContrast, disabled, highlighted: pressed,
  })
  const text = useTextStyle({ size: cfg.itemFont, color: colors.text, compact: true, truncate: true })
  const checked = ctx.value === value
  const gutter = metrics.px(cfg.gutter)

  return (
    <Pressable
      testID={testID}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: checked, disabled: !!disabled }}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        ctx.setValue(value)
        ctx.setOpen(false)
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: metrics.px(cfg.itemHeight),
        // the left gutter is always reserved; the right padding equals it
        paddingLeft: gutter,
        paddingRight: gutter,
        borderRadius: metrics.radius(cfg.itemRadius),
        backgroundColor: colors.bg,
      }}
    >
      {checked ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: gutter, alignItems: 'center', justifyContent: 'center' }}>
          <Check size={metrics.px(cfg.check)} color={colors.text} />
        </View>
      ) : null}
      {typeof children === 'string' || typeof children === 'number'
        ? <RNText {...text.textProps} style={text.style}>{children}</RNText>
        : children}
    </Pressable>
  )
}

function SelectGroup({ children }: { children?: React.ReactNode }) {
  const registering = useContext(RegistryContext)
  return registering ? <>{children}</> : <View>{children}</View>
}
SelectGroup.displayName = 'Select.Group'

function SelectLabel({ children }: { children?: React.ReactNode }) {
  const registering = useRegister({ kind: 'label' })
  return registering ? null : <SelectLabelRow>{children}</SelectLabelRow>
}
SelectLabel.displayName = 'Select.Label'

function SelectLabelRow({ children }: { children?: React.ReactNode }) {
  const ctx = useSelect('Label')
  const metrics = useMetrics()
  const chrome = useVariantColors('menuChrome', {})
  const cfg = CONTENT[ctx.size]
  const text = useTextStyle({ size: cfg.labelFont, color: chrome.label, compact: true })
  const gutter = metrics.px(cfg.gutter)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: metrics.px(cfg.itemHeight), paddingHorizontal: gutter }}>
      {typeof children === 'string' ? <RNText {...text.textProps} style={text.style}>{children}</RNText> : children}
    </View>
  )
}

function SelectSeparator() {
  const registering = useRegister({ kind: 'separator' })
  return registering ? null : <SelectSeparatorRow />
}
SelectSeparator.displayName = 'Select.Separator'

function SelectSeparatorRow() {
  const ctx = useSelect('Separator')
  const metrics = useMetrics()
  const chrome = useVariantColors('menuChrome', {})
  const cfg = CONTENT[ctx.size]
  return (
    <View style={{
      height: 1, backgroundColor: chrome.separator, marginVertical: metrics.space(2),
      marginLeft: metrics.px(cfg.gutter), marginRight: metrics.space(ctx.size === 1 ? 2 : 3),
    }} />
  )
}

/**
 * Picks one value from a list, like Radix Themes `Select`: a trigger in
 * surface / classic / soft / ghost and a list in solid / soft. By default the
 * list opens with the selected item over the trigger (Radix `item-aligned`);
 * `position="popper"` places it below.
 */
export const Select = Object.assign(SelectRoot, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
})
