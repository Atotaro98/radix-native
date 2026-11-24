import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text as RNText, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useVariantColors } from '../../hooks/useVariantColors'
import { placeItemAligned } from '../../utils/selectLayout'
import type { Rect } from '../../utils/popper'
import type { AnchoredPlacementProps } from '../internal/AnchoredContent'
import { useControl } from '../internal/control'
import { ListLabel, ListRow, ListSeparator, rowHeight, useListMetrics, type ListLook } from '../internal/ListRows'
import { anchorRef, createOverlayContext, useOverlayState, type OverlayState } from '../internal/overlayRoot'
import { createPortalContext } from '../internal/portalContext'
import { PopperContent } from '../internal/PopperContent'
import type { AccentColor } from '../../tokens/colors/types'
import type { RadiusToken } from '../../theme/theme.types'
import type { MarginProps } from '../../types/marginProps'
import type { MenuVariant, SelectTriggerVariant } from '../../utils/variantPalette'
import { paintSurface } from '../internal/surface'

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

// ─── Context ──────────────────────────────────────────────────────────────────

interface SelectContextValue extends OverlayState {
  size: SelectSize
  value: string | undefined
  setValue: (v: string) => void
  disabled: boolean
  /** The content's rows in order, known before it ever opens (see ItemRegistry). */
  entries: Entry[]
  register: (key: object, entry: Entry) => () => void
  triggerPadX: React.MutableRefObject<number>
}

type Entry = { kind: 'item'; value: string; label: React.ReactNode } | { kind: 'label' } | { kind: 'separator' }

/** True while Content renders its children only to register them (RN can't mirror item text like Radix). */
const RegistryContext = createContext(false)

function useRegister(entry: Entry) {
  const ctx = useContext(Select_.Context)
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

const Select_ = createOverlayContext<SelectContextValue>('Select')
const useSelect = Select_.use
/** The list's item colors (Content's variant, color, high contrast); bridged to the rows in the portal. */
const ContentContext = createPortalContext<ListLook | null>('Select content', null)

// ─── Root ─────────────────────────────────────────────────────────────────────

function SelectRoot({
  size = 2, value: valueProp, defaultValue, onValueChange, open: openProp, defaultOpen = false, onOpenChange, disabled = false, children,
}: SelectRootProps) {
  const [value, setValue] = useControllableState<string | undefined>({ prop: valueProp, defaultProp: defaultValue, onChange: onValueChange as (v: string | undefined) => void })
  const overlay = useOverlayState({ open: openProp, defaultOpen, onOpenChange })
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
    ...overlay, size, value, setValue: (v: string) => setValue(v), disabled, entries, register, triggerPadX,
  }), [overlay, size, value, setValue, disabled, entries, register])
  return <Select_.Provider value={ctx}>{children}</Select_.Provider>
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
  const showPlaceholder = ctx.value === undefined || ctx.value === ''
  const text = useTextStyle({ size: cfg.font, color: showPlaceholder ? colors.placeholder : colors.text, compact: true, truncate: true })
  const ghost = variant === 'ghost'
  const borderRadius = metrics.radius(cfg.radius, 'pill')
  const padX = metrics.px(ghost ? cfg.ghostPadX : cfg.padX)
  // Where the value text starts, for item-aligned placement (read when the list opens)
  useLayoutEffect(() => { ctx.triggerPadX.current = padX }, [ctx.triggerPadX, padX])

  const selectedEntry = ctx.entries.find((e) => e.kind === 'item' && e.value === ctx.value)
  const label = children ?? (showPlaceholder ? placeholder : selectedEntry?.kind === 'item' ? selectedEntry.label : undefined)
  const labelText = typeof label === 'string' ? label : undefined
  const content = typeof label === 'string' || typeof label === 'number'
    ? <RNText {...text.textProps} style={[text.style, { flexShrink: 1 }]}>{label}</RNText>
    : label

  const surface = paintSurface(colors, borderRadius)
  const toggleOpen = useCallback(() => ctx.setOpen(!ctx.open), [ctx])
  // No press scale (plain Pressable); named by the consumer's label, its value read as accessibilityValue
  const control = useControl({
    props: { testID, accessibilityLabel },
    children: null,
    role: 'combobox',
    onPress: toggleOpen,
    disabled: ctx.disabled,
    state: { expanded: ctx.open },
    focusRing: { color, borderRadius },
  })

  const triggerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'flex-start',
    gap: metrics.px(cfg.gap),
    paddingHorizontal: padX,
    ...(ghost
      // ghost: fit-content height, padding offset by an equal negative margin
      ? { paddingVertical: metrics.px(cfg.ghostPadY), marginVertical: -metrics.px(cfg.ghostPadY), marginHorizontal: -padX }
      : { height: metrics.px(cfg.height) }),
    ...margins,
  }

  return (
    <Pressable
      {...control.pressableProps}
      ref={anchorRef(ctx.anchor)}
      accessibilityValue={labelText ? { text: labelText } : undefined}
      style={[triggerStyle, surface.style, style]}
    >
      {content}
      <Chevron size={metrics.px(cfg.icon)} color={colors.icon} />
      {surface.over}
      {control.focusRing}
    </Pressable>
  )
}
SelectTrigger.displayName = 'Select.Trigger'

// ─── Content ──────────────────────────────────────────────────────────────────

function SelectContent({
  variant = 'solid', color, highContrast, position = 'item-aligned', side = 'bottom', sideOffset = 4, align = 'start', children, ...props
}: SelectContentProps) {
  const ctx = useSelect('Content')
  const list = useListMetrics(ctx.size)
  const close = useCallback(() => ctx.setOpen(false), [ctx])
  const look = useMemo(() => ({ variant, color, highContrast }), [variant, color, highContrast])

  // The selected item (else the first) and the px of the rows above it, from the heights the rows render with
  const items = ctx.entries.filter((e): e is Extract<Entry, { kind: 'item' }> => e.kind === 'item')
  const target = items.find((e) => e.value === ctx.value) ?? items[0]
  let selectedIndex = 0
  let offsetBefore = 0
  for (const e of ctx.entries) {
    if (e === target) break
    if (e.kind === 'item') selectedIndex++
    else offsetBefore += rowHeight(list, e.kind)
  }
  const placeOverride = useMemo(() => position === 'item-aligned'
    ? (anchor: Rect, size: { width: number; height: number }, boundary: Rect) =>
      placeItemAligned({
        trigger: anchor,
        triggerPaddingX: ctx.triggerPadX.current,
        content: size,
        boundary,
        contentPadding: list.padding,
        itemPaddingLeft: list.gutter,
        itemHeight: rowHeight(list, 'item'),
        selectedIndex,
        offsetBefore,
      })
    : undefined, [position, ctx.triggerPadX, list, selectedIndex, offsetBefore])

  return (
    <>
      {/* Always mounted, renders nothing: lets the trigger show the selected text before the list opens */}
      <RegistryContext.Provider value>{children}</RegistryContext.Provider>
      <ContentContext.Provider value={look}>
        <PopperContent
          padding={list.padding}
          borderRadius={list.borderRadius}
          accessibilityRole="list"
          open={ctx.open}
          onDismiss={close}
          anchor={ctx.anchor}
          modal
          matchAnchorWidth
          placeOverride={placeOverride}
          side={side} sideOffset={sideOffset} align={align}
          {...props}
        >
          {children}
        </PopperContent>
      </ContentContext.Provider>
    </>
  )
}
SelectContent.displayName = 'Select.Content'

// ─── Items ────────────────────────────────────────────────────────────────────

function SelectItem(props: SelectItemProps) {
  const registering = useRegister({ kind: 'item', value: props.value, label: props.textValue ?? props.children })
  return registering ? null : <SelectItemRow {...props} />
}
SelectItem.displayName = 'Select.Item'

/** `.rt-SelectItem`: the left gutter is always reserved, and the right padding equals it. */
function SelectItemRow({ value, disabled, testID, children }: SelectItemProps) {
  const ctx = useSelect('Item')
  const look = useContext(ContentContext)
  const list = useListMetrics(ctx.size)
  const checked = ctx.value === value
  return (
    <ListRow
      list={list}
      look={look ?? DEFAULT_LOOK}
      paddingLeft={list.gutter}
      paddingRight={list.gutter}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: checked }}
      disabled={disabled}
      checked={checked}
      onPress={() => {
        ctx.setValue(value)
        ctx.setOpen(false)
      }}
      testID={testID}
    >
      {children}
    </ListRow>
  )
}

const DEFAULT_LOOK: ListLook = { variant: 'solid' }

function SelectGroup({ children }: { children?: React.ReactNode }) {
  const registering = useContext(RegistryContext)
  return registering ? <>{children}</> : <View>{children}</View>
}
SelectGroup.displayName = 'Select.Group'

function SelectLabel({ children }: { children?: React.ReactNode }) {
  const registering = useRegister({ kind: 'label' })
  const ctx = useSelect('Label')
  const list = useListMetrics(ctx.size)
  return registering ? null : <ListLabel list={list} paddingLeft={list.gutter} paddingRight={list.gutter}>{children}</ListLabel>
}
SelectLabel.displayName = 'Select.Label'

function SelectSeparator() {
  const registering = useRegister({ kind: 'separator' })
  const ctx = useSelect('Separator')
  const list = useListMetrics(ctx.size)
  return registering ? null : <ListSeparator list={list} marginLeft={list.gutter} marginRight={list.padX} />
}
SelectSeparator.displayName = 'Select.Separator'

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
