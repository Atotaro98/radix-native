import React, { useCallback, useContext, useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import type { AnchoredPlacementProps } from './AnchoredContent'
import { ListLabel, ListRow, ListSeparator, ListShortcut, useListMetrics, type ListLook, type ListMetrics } from './ListRows'
import { anchorRef, createOverlayContext, useOverlayState, type OverlayState } from './overlayRoot'
import { createPortalContext } from './portalContext'
import { PopperContent } from './PopperContent'
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

// ─── Contexts ─────────────────────────────────────────────────────────────────
// All bridged across the portal: a part reads them wherever its content renders

interface MenuContentValue extends ListLook {
  size: MenuSize
  list: ListMetrics
  /** Some item in this content shows an indicator: every row reserves the wide left gutter. */
  gutter: boolean
  /** Closes the whole menu (root and subs). */
  closeAll: () => void
}

/** The root of a DropdownMenu or ContextMenu: open state and anchor. */
export const MenuRoot = createOverlayContext<OverlayState>('Menu', 'its Root')
const MenuContentContext = createPortalContext<MenuContentValue | null>('Menu content', null)
const RadioGroupContext = createPortalContext<{ value?: string; onValueChange?: (v: string) => void } | null>('Menu radio group', null)
const Sub = createOverlayContext<OverlayState>('Menu', 'Menu.Sub')

function useContent(part: string): MenuContentValue {
  const ctx = useContext(MenuContentContext)
  if (!ctx) throw new Error(`${part} must be used within a menu Content`)
  return ctx
}

/** A row's padding-left: the wide gutter when some row in its content shows an indicator. */
const rowStart = (content: MenuContentValue) => (content.gutter ? content.list.gutter : content.list.padX)

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

function useContentValue(size: MenuSize, look: ListLook, children: React.ReactNode, closeAll: () => void) {
  const list = useListMetrics(size)
  const { variant, color, highContrast } = look
  return useMemo<MenuContentValue>(() => ({
    size, list, variant, color, highContrast, gutter: hasIndicatorItems(children), closeAll,
  }), [size, list, variant, color, highContrast, children, closeAll])
}

/**
 * Internal: a menu's content (DropdownMenu / ContextMenu). A modal Anchored
 * overlay: its backdrop swallows outside touches, as Radix menus are modal.
 */
export function MenuContent({
  size = 2, variant = 'solid', color, highContrast, side = 'bottom', sideOffset = 4, align = 'start', ...props
}: MenuContentProps) {
  const root = MenuRoot.use('Content')
  const close = useCallback(() => root.setOpen(false), [root])
  const value = useContentValue(size, { variant, color, highContrast }, props.children, close)
  return (
    <MenuContentContext.Provider value={value}>
      <PopperContent
        padding={value.list.padding}
        borderRadius={value.list.borderRadius}
        accessibilityRole="menu"
        open={root.open}
        onDismiss={close}
        anchor={root.anchor}
        modal
        side={side} sideOffset={sideOffset} align={align}
        {...props}
      />
    </MenuContentContext.Provider>
  )
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

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
  /** Runs before the close (checkbox toggle, radio change). */
  onActivate?: () => void
}

/** An item: `onSelect` gets an event whose `preventDefault()` keeps the whole menu open. */
function MenuRow({ role, checked, color, shortcut, disabled, onSelect, onActivate, testID, children }: RowProps) {
  const content = useContent('Menu item')
  const onPress = useCallback(() => {
    let prevented = false
    const event: MenuSelectEvent = {
      preventDefault: () => { prevented = true },
      get defaultPrevented() { return prevented },
    }
    onSelect?.(event)
    onActivate?.()
    if (!prevented) content.closeAll()
  }, [onSelect, onActivate, content])

  return (
    <ListRow
      list={content.list}
      look={content}
      color={color}
      paddingLeft={rowStart(content)}
      paddingRight={content.list.padX}
      accessibilityRole={role === 'menuitem' ? 'menuitem' : role === 'menuitemcheckbox' ? 'checkbox' : 'radio'}
      accessibilityState={role === 'menuitem' ? undefined : { checked: checked === 'indeterminate' ? 'mixed' : !!checked }}
      disabled={disabled}
      checked={!!checked}
      onPress={onPress}
      trailing={shortcut ? (c) => <ListShortcut list={content.list} color={c.shortcut}>{shortcut}</ListShortcut> : undefined}
      testID={testID}
    >
      {children}
    </ListRow>
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
  return <ListLabel list={content.list} paddingLeft={rowStart(content)} paddingRight={content.list.padX}>{children}</ListLabel>
}
MenuLabel.displayName = 'Menu.Label'

export function MenuGroup({ children }: { children?: React.ReactNode }) {
  return <View accessibilityRole="none">{children}</View>
}
MenuGroup.displayName = 'Menu.Group'

export function MenuSeparator() {
  const content = useContent('Menu.Separator')
  return <ListSeparator list={content.list} marginLeft={rowStart(content)} marginRight={content.list.padX} />
}
MenuSeparator.displayName = 'Menu.Separator'

// ─── Sub-menus ────────────────────────────────────────────────────────────────

export function MenuSub({ children, ...state }: MenuSubProps) {
  return <Sub.Provider value={useOverlayState(state)}>{children}</Sub.Provider>
}
MenuSub.displayName = 'Menu.Sub'

/** Opens its sub on press (Radix also on hover); the parent menu stays open. */
export function MenuSubTrigger({ disabled, testID, children }: { disabled?: boolean; testID?: string; children?: React.ReactNode }) {
  const sub = Sub.use('SubTrigger')
  const content = useContent('Menu.SubTrigger')
  const metrics = useMetrics()
  return (
    <ListRow
      list={content.list}
      look={content}
      paddingLeft={rowStart(content)}
      paddingRight={content.list.padX}
      accessibilityRole="menuitem"
      accessibilityState={{ expanded: sub.open }}
      subOpen={sub.open}
      disabled={disabled}
      testID={testID}
      rowRef={anchorRef(sub.anchor)}
      onPress={() => sub.setOpen(!sub.open)}
      trailing={(c) => (
        <View style={{ marginRight: -2 * metrics.scaling }}><Chevron size={content.list.icon} color={c.text} /></View>
      )}
    >
      {children}
    </ListRow>
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
  size, variant, color, highContrast, sideOffset = 1, align = 'start', alignOffset, ...props
}: Omit<MenuContentProps, 'side'>) {
  const sub = Sub.use('SubContent')
  const parent = useContent('Menu.SubContent')
  const root = useContext(MenuRoot.Context)
  const close = useCallback(() => sub.setOpen(false), [sub])
  const value = useContentValue(
    size ?? parent.size,
    { variant: variant ?? parent.variant, color: color ?? parent.color, highContrast: highContrast ?? parent.highContrast },
    props.children,
    parent.closeAll,
  )
  return (
    <MenuContentContext.Provider value={value}>
      <PopperContent
        padding={value.list.padding}
        borderRadius={value.list.borderRadius}
        accessibilityRole="menu"
        open={sub.open && (root?.open ?? true)}
        onDismiss={close}
        anchor={sub.anchor}
        side="right" sideOffset={sideOffset} align={align}
        alignOffset={alignOffset ?? -value.list.padding}
        {...props}
      />
    </MenuContentContext.Provider>
  )
}
MenuSubContent.displayName = 'Menu.SubContent'
